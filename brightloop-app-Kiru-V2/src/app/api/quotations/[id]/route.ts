import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quotationLines, quotations } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateQuotationSchema } from "@/lib/validation";
import { resolveLineItems, LineItemError } from "@/lib/line-items";
import { staffCanAccessAllProducts, getStaffProductIds } from "@/lib/staff-access";
import { logAudit } from "@/lib/audit";

async function loadQuotation(id: number) {
  const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  if (!quotation) return null;
  const lines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, id));
  return { quotation, lines };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const detail = await loadQuotation(quotationId);
  if (!detail) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  if (session.role === "CUSTOMER" && detail.quotation.customerId !== session.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role === "STAFF") {
    // Viewing only requires involvement in at least one line; write
    // operations (PATCH/send/convert) require authorization for every line.
    const productIds = detail.lines.map((l) => l.productId);
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const isInvolved = productIds.some((id) => staffProductIds.has(id));
    if (!isInvolved) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = updateQuotationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [existing] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT quotations can be edited" }, { status: 409 });
  }

  if (session.role === "STAFF") {
    const existingLines = await db.select({ productId: quotationLines.productId }).from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    const newProductIds = parsed.data.lines?.map((l) => l.productId) ?? existingLines.map((l) => l.productId);
    const allowed = await staffCanAccessAllProducts(db, session.userId, newProductIds);
    if (!allowed) return NextResponse.json({ error: "You are not authorized to manage one or more of these products" }, { status: 403 });
  }

  const { lines, ...quotationData } = parsed.data;

  try {
    const updated = await db.transaction(async (tx) => {
      let totals: { subtotal: string; discountTotal: string; taxTotal: string; grandTotal: string } | null = null;

      if (lines) {
        const resolvedLines = await resolveLineItems(tx, lines);
        await tx.delete(quotationLines).where(eq(quotationLines.quotationId, quotationId));
        await tx.insert(quotationLines).values(resolvedLines.lines.map((l) => ({ ...l, quotationId })));
        totals = resolvedLines;
      }

      const [quotation] = await tx
        .update(quotations)
        .set({
          ...quotationData,
          ...(totals ? { subtotal: totals.subtotal, discountTotal: totals.discountTotal, taxTotal: totals.taxTotal, grandTotal: totals.grandTotal } : {}),
          updatedAt: new Date(),
        })
        .where(eq(quotations.id, quotationId))
        .returning();

      await logAudit(tx, { userId: session.userId, action: "UPDATED", entityType: "quotation", entityId: quotationId, newValues: quotationData });
      return quotation;
    });

    return NextResponse.json({ quotation: updated });
  } catch (err) {
    if (err instanceof LineItemError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
