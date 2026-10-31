import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptionLines, subscriptions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { isValidTransition } from "@/lib/subscription-lifecycle";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isInteger(subscriptionId)) return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });

  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (!isValidTransition(subscription.status, "ACTIVE")) {
    return NextResponse.json({ error: `Cannot activate a subscription in status ${subscription.status}` }, { status: 409 });
  }

  if (session.role === "STAFF") {
    const lines = await db.select({ productId: subscriptionLines.productId }).from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, subscriptionId));
    const allowed = await staffCanAccessAllProducts(db, session.userId, lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to activate this subscription" }, { status: 403 });
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx.update(subscriptions).set({ status: "ACTIVE", updatedAt: new Date() }).where(eq(subscriptions.id, subscriptionId)).returning();
    await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "subscription", entityId: subscriptionId, oldValues: { status: subscription.status }, newValues: { status: "ACTIVE" } });
    return row;
  });

  return NextResponse.json({ subscription: updated });
}
