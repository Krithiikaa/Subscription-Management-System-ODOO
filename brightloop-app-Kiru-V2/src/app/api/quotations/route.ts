import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, quotationLines, quotations } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createQuotationSchema, QUOTATION_STATUSES } from "@/lib/validation";
import { resolveLineItems, LineItemError } from "@/lib/line-items";
import { staffCanAccessAllProducts, getStaffProductIds } from "@/lib/staff-access";
import { logAudit } from "@/lib/audit";
import { tempNumber, finalNumber } from "@/lib/numbering";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const customerIdParam = url.searchParams.get("customerId");

  const filters = [];
  if (status && (QUOTATION_STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(quotations.status, status as (typeof QUOTATION_STATUSES)[number]));
  }

  if (session.role === "CUSTOMER") {
    if (!session.customerId) return NextResponse.json({ quotations: [] });
    filters.push(eq(quotations.customerId, session.customerId));
  } else if (customerIdParam && Number.isInteger(Number(customerIdParam))) {
    filters.push(eq(quotations.customerId, Number(customerIdParam)));
  }

  const rows = await db
    .select()
    .from(quotations)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(quotations.createdAt);

  let visible = rows;
  if (session.role === "STAFF") {
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const lines = await db.select({ quotationId: quotationLines.quotationId, productId: quotationLines.productId }).from(quotationLines);
    const visibleIds = new Set(lines.filter((l) => staffProductIds.has(l.productId)).map((l) => l.quotationId));
    visible = rows.filter((q) => visibleIds.has(q.id));
  }

  return NextResponse.json({ quotations: visible });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const body = await request.json().catch(() => null);
  const parsed = createQuotationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, parsed.data.customerId)).limit(1);
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  if (session.role === "STAFF") {
    const productIds = parsed.data.lines.map((l) => l.productId);
    const allowed = await staffCanAccessAllProducts(db, session.userId, productIds);
    if (!allowed) {
      return NextResponse.json({ error: "You are not authorized to create a quotation containing one or more of these products" }, { status: 403 });
    }
  }

  try {
    const result = await db.transaction(async (tx) => {
      const resolvedLines = await resolveLineItems(tx, parsed.data.lines);

      const [created] = await tx
        .insert(quotations)
        .values({
          number: tempNumber("QUO"),
          customerId: parsed.data.customerId,
          createdBy: session.userId,
          templateId: parsed.data.templateId,
          paymentTerms: parsed.data.paymentTerms,
          currency: parsed.data.currency,
          notes: parsed.data.notes,
          termsAndConditions: parsed.data.termsAndConditions,
          validUntil: parsed.data.validUntil,
          subtotal: resolvedLines.subtotal,
          discountTotal: resolvedLines.discountTotal,
          taxTotal: resolvedLines.taxTotal,
          grandTotal: resolvedLines.grandTotal,
        })
        .returning();

      const [withNumber] = await tx
        .update(quotations)
        .set({ number: finalNumber("QUO", created.id) })
        .where(eq(quotations.id, created.id))
        .returning();

      await tx.insert(quotationLines).values(resolvedLines.lines.map((l) => ({ ...l, quotationId: created.id })));
      await logAudit(tx, { userId: session.userId, action: "CREATED", entityType: "quotation", entityId: created.id, newValues: { number: withNumber.number, customerId: parsed.data.customerId } });

      return { quotation: withNumber, lines: resolvedLines.lines };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof LineItemError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
