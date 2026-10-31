import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { validateSubscriptionTransition } from "@/lib/subscriptions/state-machine";
import { SubscriptionStatus } from "@prisma/client";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const transitionSchema = z.object({
  toStatus: z.enum(["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"]),
  note: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const body = await req.json();
    const parsed = transitionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { toStatus, note } = parsed.data;

    // Load subscription with plan and customer
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true, customer: true, template: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Customer isolation check
    if (user.role === "CUSTOMER") {
      if (subscription.customerId !== user.customerId) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      // Customers cannot confirm their own draft or quotation directly unless staff confirms
      if (toStatus !== "PAUSED" && toStatus !== "CLOSED" && toStatus !== "ACTIVE") {
        return NextResponse.json(
          { error: "Customers can only pause, close, or resume their own subscriptions." },
          { status: 403 }
        );
      }
    }

    // Enforce State Machine rules
    const check = validateSubscriptionTransition({
      fromStatus: subscription.status,
      toStatus: toStatus as SubscriptionStatus,
      plan: subscription.plan,
      quotationCreatedAt: subscription.createdAt,
      validityDays: subscription.template?.validityDays || 15,
    });

    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = { status: toStatus };

    // When becoming ACTIVE for the first time: set nextInvoiceDate = startDate
    if (toStatus === "ACTIVE" && !subscription.nextInvoiceDate) {
      updateData.nextInvoiceDate = subscription.startDate;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: updateData,
        include: { plan: true, customer: { include: { user: true } } },
      });

      // Log status transition
      await tx.subscriptionStatusLog.create({
        data: {
          subscriptionId: sub.id,
          fromStatus: subscription.status,
          toStatus: toStatus as SubscriptionStatus,
          changedById: user.userId,
          note: note || `Status changed from ${subscription.status} to ${toStatus}`,
        },
      });

      return sub;
    });

    return NextResponse.json({
      message: `Subscription transitioned to ${toStatus}`,
      subscription: updated,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

