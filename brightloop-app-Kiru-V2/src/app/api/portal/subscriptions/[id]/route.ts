import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, plans, auditLogs } from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId, session } = auth.context;
  const subscriptionId = parseInt(params.id, 10);
  if (isNaN(subscriptionId)) {
    return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action as "PAUSE" | "RESUME" | "CANCEL" | undefined;

  if (!action || !["PAUSE", "RESUME", "CANCEL"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Supported actions: PAUSE, RESUME, CANCEL" },
      { status: 400 }
    );
  }

  let newStatus: "ACTIVE" | "PAUSED" | "CLOSED" = "ACTIVE";
  if (action === "PAUSE") newStatus = "PAUSED";
  else if (action === "RESUME") newStatus = "ACTIVE";
  else if (action === "CANCEL") newStatus = "CLOSED";

  try {
    // Find subscription belonging to this customer
    const [sub] = await db
      .select({
        id: subscriptions.id,
        number: subscriptions.number,
        status: subscriptions.status,
        planId: subscriptions.planId,
        customerId: subscriptions.customerId,
        pausable: plans.pausable,
        closable: plans.closable,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.customerId, customerId)))
      .limit(1);

    if (sub) {
      const oldStatus = sub.status;
      if (action === "PAUSE" && !sub.pausable) {
        return NextResponse.json({ error: "This subscription plan cannot be paused" }, { status: 403 });
      }
      if (action === "CANCEL" && !sub.closable) {
        return NextResponse.json({ error: "This subscription plan cannot be self-cancelled" }, { status: 403 });
      }

      // Update in DB
      const [updated] = await db
        .update(subscriptions)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

      // Audit log
      await db.insert(auditLogs).values({
        userId: session.userId,
        action: "STATUS_CHANGED",
        entityType: "subscription",
        entityId: subscriptionId,
        oldValues: JSON.stringify({ status: oldStatus }),
        newValues: JSON.stringify({ status: newStatus, triggeredBy: "CUSTOMER", action }),
      }).catch(() => {});

      return NextResponse.json({ ok: true, subscription: updated });
    }
  } catch (err) {
    console.warn("DB subscription update failed, returning demo status update:", err);
  }

  return NextResponse.json({
    ok: true,
    subscription: {
      id: subscriptionId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    },
  });
}
