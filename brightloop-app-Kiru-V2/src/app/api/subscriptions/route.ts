import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, subscriptionLines, subscriptions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createSubscriptionSchema, SUBSCRIPTION_STATUSES } from "@/lib/validation";
import { resolveLineItems, LineItemError } from "@/lib/line-items";
import { staffCanAccessAllProducts, getStaffProductIds } from "@/lib/staff-access";
import { logAudit } from "@/lib/audit";
import { tempNumber, finalNumber } from "@/lib/numbering";
import { advanceBillingDate } from "@/lib/utils";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const customerIdParam = url.searchParams.get("customerId");

  const filters = [];
  if (status && (SUBSCRIPTION_STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(subscriptions.status, status as (typeof SUBSCRIPTION_STATUSES)[number]));
  }
  if (session.role === "CUSTOMER") {
    if (!session.customerId) return NextResponse.json({ subscriptions: [] });
    filters.push(eq(subscriptions.customerId, session.customerId));
  } else if (customerIdParam && Number.isInteger(Number(customerIdParam))) {
    filters.push(eq(subscriptions.customerId, Number(customerIdParam)));
  }

  const rows = await db
    .select()
    .from(subscriptions)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(subscriptions.createdAt);

  let visible = rows;
  if (session.role === "STAFF") {
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const lines = await db.select({ subscriptionId: subscriptionLines.subscriptionId, productId: subscriptionLines.productId }).from(subscriptionLines);
    const visibleIds = new Set(lines.filter((l) => staffProductIds.has(l.productId)).map((l) => l.subscriptionId));
    visible = rows.filter((s) => visibleIds.has(s.id) || s.assignedStaffId === session.userId);
  }

  return NextResponse.json({ subscriptions: visible });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const body = await request.json().catch(() => null);
  const parsed = createSubscriptionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, parsed.data.customerId)).limit(1);
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  if (session.role === "STAFF") {
    const allowed = await staffCanAccessAllProducts(db, session.userId, parsed.data.lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to create a subscription containing one or more of these products" }, { status: 403 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const resolvedLines = await resolveLineItems(tx, parsed.data.lines);

      const [sub] = await tx
        .insert(subscriptions)
        .values({
          number: tempNumber("SUB"),
          customerId: parsed.data.customerId,
          createdBy: session.userId,
          assignedStaffId: parsed.data.assignedStaffId,
          status: "DRAFT",
          startDate: parsed.data.startDate,
          expiryDate: parsed.data.expiryDate,
          paymentTerms: parsed.data.paymentTerms,
          notes: parsed.data.notes,
        })
        .returning();

      const nextBillingDates = resolvedLines.lines.map((l) => advanceBillingDate(new Date(parsed.data.startDate), l.billingPeriod).toISOString().slice(0, 10));
      const nextBillingDate = nextBillingDates.length > 0 ? nextBillingDates.reduce((min, d) => (d < min ? d : min)) : null;

      const [withNumber] = await tx
        .update(subscriptions)
        // planId mirrors the first line's plan — the customer portal joins on it.
        .set({ number: finalNumber("SUB", sub.id), nextBillingDate, planId: resolvedLines.lines[0]?.planId })
        .where(eq(subscriptions.id, sub.id))
        .returning();

      await tx.insert(subscriptionLines).values(
        resolvedLines.lines.map((l) => ({
          subscriptionId: sub.id,
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
        }))
      );

      await logAudit(tx, { userId: session.userId, action: "CREATED", entityType: "subscription", entityId: sub.id, newValues: { number: withNumber.number } });
      return withNumber;
    });

    return NextResponse.json({ subscription: result }, { status: 201 });
  } catch (err) {
    if (err instanceof LineItemError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
