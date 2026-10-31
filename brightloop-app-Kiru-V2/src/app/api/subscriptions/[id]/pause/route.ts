import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptionLines, subscriptions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { isValidTransition, loadPlanPermissionsForSubscription, planPermissionsAllow } from "@/lib/subscription-lifecycle";
import { pauseSubscriptionSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isInteger(subscriptionId)) return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = pauseSubscriptionSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (!isValidTransition(subscription.status, "PAUSED")) {
    return NextResponse.json({ error: `Cannot pause a subscription in status ${subscription.status}` }, { status: 409 });
  }

  const lines = await db.select({ productId: subscriptionLines.productId }).from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, subscriptionId));
  if (session.role === "STAFF") {
    const allowed = await staffCanAccessAllProducts(db, session.userId, lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to pause this subscription" }, { status: 403 });
  }

  const permissions = await loadPlanPermissionsForSubscription(db, subscriptionId);
  if (!planPermissionsAllow(permissions, "pausable")) {
    return NextResponse.json({ error: "One or more plans on this subscription do not permit pausing" }, { status: 409 });
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(subscriptions)
      .set({ status: "PAUSED", pausedAt: new Date(), pausedBy: session.userId, pauseReason: parsed.data.reason, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "subscription", entityId: subscriptionId, oldValues: { status: subscription.status }, newValues: { status: "PAUSED", reason: parsed.data.reason } });
    return row;
  });

  return NextResponse.json({ subscription: updated });
}
