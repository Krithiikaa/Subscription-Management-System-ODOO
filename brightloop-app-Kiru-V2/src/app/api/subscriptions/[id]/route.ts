import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptionLines, subscriptions, users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { assignStaffToSubscriptionSchema } from "@/lib/validation";
import { getStaffProductIds } from "@/lib/staff-access";
import { logAudit } from "@/lib/audit";

async function loadSubscription(id: number) {
  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  if (!subscription) return null;
  const lines = await db.select().from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, id));
  return { subscription, lines };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isInteger(subscriptionId)) return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });

  const detail = await loadSubscription(subscriptionId);
  if (!detail) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  if (session.role === "CUSTOMER" && detail.subscription.customerId !== session.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role === "STAFF" && detail.subscription.assignedStaffId !== session.userId) {
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const isInvolved = detail.lines.some((l) => staffProductIds.has(l.productId));
    if (!isInvolved) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isInteger(subscriptionId)) return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = assignStaffToSubscriptionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  if (parsed.data.assignedStaffId) {
    const [staff] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, parsed.data.assignedStaffId)).limit(1);
    if (!staff || staff.role !== "STAFF") return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(subscriptions)
      .set({ assignedStaffId: parsed.data.assignedStaffId, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    if (row) await logAudit(tx, { userId: auth.session.userId, action: "UPDATED", entityType: "subscription", entityId: subscriptionId, newValues: { assignedStaffId: parsed.data.assignedStaffId } });
    return row;
  });

  if (!updated) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  return NextResponse.json({ subscription: updated });
}
