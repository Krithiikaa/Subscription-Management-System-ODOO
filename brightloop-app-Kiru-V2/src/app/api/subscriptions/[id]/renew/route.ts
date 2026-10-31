import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { subscriptionLines, subscriptions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { loadPlanPermissionsForSubscription, planPermissionsAllow } from "@/lib/subscription-lifecycle";
import { renewSubscriptionSchema } from "@/lib/validation";
import { resolveLineItems, LineItemError } from "@/lib/line-items";
import { logAudit } from "@/lib/audit";
import { tempNumber, finalNumber } from "@/lib/numbering";
import { advanceBillingDate } from "@/lib/utils";

class AlreadyRenewed extends Error {}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isInteger(subscriptionId)) return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = renewSubscriptionSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const [old] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!old) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (old.status !== "ACTIVE") {
    return NextResponse.json({ error: `Only an ACTIVE subscription can be renewed (status: ${old.status})` }, { status: 409 });
  }
  if (old.renewedToSubscriptionId) {
    return NextResponse.json({ error: "This subscription has already been renewed" }, { status: 409 });
  }

  const oldLines = await db.select().from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, subscriptionId));
  if (session.role === "STAFF") {
    const allowed = await staffCanAccessAllProducts(db, session.userId, oldLines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to renew this subscription" }, { status: 403 });
  }

  const permissions = await loadPlanPermissionsForSubscription(db, subscriptionId);
  if (!planPermissionsAllow(permissions, "renewable")) {
    return NextResponse.json({ error: "One or more plans on this subscription do not permit renewal" }, { status: 409 });
  }

  const startDate = parsed.data.startDate ?? (old.expiryDate ? addDays(old.expiryDate, 1) : old.nextBillingDate ?? new Date().toISOString().slice(0, 10));

  try {
    const result = await db.transaction(async (tx) => {
      await tx
        .update(subscriptions)
        .set({ status: "CLOSED", closedAt: new Date(), closedBy: session.userId, closureReason: "Renewed", updatedAt: new Date() })
        .where(eq(subscriptions.id, subscriptionId));

      const [newSub] = await tx
        .insert(subscriptions)
        .values({
          number: tempNumber("SUB"),
          customerId: old.customerId,
          createdBy: session.userId,
          assignedStaffId: old.assignedStaffId,
          status: "ACTIVE",
          startDate,
          expiryDate: parsed.data.expiryDate,
          paymentTerms: old.paymentTerms,
          notes: old.notes,
          renewedFromSubscriptionId: old.id,
        })
        .returning();

      let linesToInsert;
      if (parsed.data.lines) {
        const resolved = await resolveLineItems(tx, parsed.data.lines);
        linesToInsert = resolved.lines.map((l) => ({
          subscriptionId: newSub.id,
          productId: l.productId,
          variantId: l.variantId,
          planId: l.planId,
          productName: l.productName,
          productCode: l.productCode,
          variantName: l.variantName,
          planName: l.planName,
          billingPeriod: l.billingPeriod,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          variantExtra: l.variantExtra,
          taxRuleId: l.taxRuleId,
          taxRatePct: l.taxRatePct,
          taxAmount: l.taxAmount,
          discountId: l.discountId,
          discountAmount: l.discountAmount,
          amount: l.lineTotal,
        }));
      } else {
        linesToInsert = oldLines.map((l) => ({
          subscriptionId: newSub.id,
          productId: l.productId,
          variantId: l.variantId,
          planId: l.planId,
          productName: l.productName,
          productCode: l.productCode,
          variantName: l.variantName,
          planName: l.planName,
          billingPeriod: l.billingPeriod,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          variantExtra: l.variantExtra,
          taxRuleId: l.taxRuleId,
          taxRatePct: l.taxRatePct,
          taxAmount: l.taxAmount,
          discountId: l.discountId,
          discountAmount: l.discountAmount,
          amount: l.amount,
        }));
      }
      await tx.insert(subscriptionLines).values(linesToInsert);

      const billingPeriods = linesToInsert.map((l) => l.billingPeriod).filter((b): b is NonNullable<typeof b> => !!b);
      const nextBillingDates = billingPeriods.map((b) => advanceBillingDate(new Date(startDate), b).toISOString().slice(0, 10));
      const nextBillingDate = nextBillingDates.length > 0 ? nextBillingDates.reduce((min, d) => (d < min ? d : min)) : null;

      const [withNumber] = await tx
        .update(subscriptions)
        .set({ number: finalNumber("SUB", newSub.id), nextBillingDate })
        .where(eq(subscriptions.id, newSub.id))
        .returning();

      // Atomic claim — prevents a concurrent duplicate renewal from leaving
      // two "renewed to" subscriptions linked to the same old one.
      const [claimedOld] = await tx
        .update(subscriptions)
        .set({ renewedToSubscriptionId: newSub.id })
        .where(and(eq(subscriptions.id, subscriptionId), isNull(subscriptions.renewedToSubscriptionId)))
        .returning();
      if (!claimedOld) throw new AlreadyRenewed();

      await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "subscription", entityId: subscriptionId, oldValues: { status: old.status }, newValues: { status: "CLOSED", reason: "Renewed", renewedTo: newSub.id } });
      await logAudit(tx, { userId: session.userId, action: "CREATED", entityType: "subscription", entityId: newSub.id, newValues: { number: withNumber.number, renewedFrom: subscriptionId } });

      return { subscription: withNumber, closedSubscriptionId: subscriptionId };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AlreadyRenewed) {
      return NextResponse.json({ error: "This subscription has already been renewed" }, { status: 409 });
    }
    if (err instanceof LineItemError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
