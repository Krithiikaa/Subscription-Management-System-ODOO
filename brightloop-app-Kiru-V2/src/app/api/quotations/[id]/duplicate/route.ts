import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quotationLines, quotations } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { logAudit } from "@/lib/audit";
import { tempNumber, finalNumber } from "@/lib/numbering";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const [source] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
  if (!source) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  const sourceLines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
  if (session.role === "STAFF") {
    const allowed = await staffCanAccessAllProducts(db, session.userId, sourceLines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to duplicate a quotation containing one or more of these products" }, { status: 403 });
  }

  const result = await db.transaction(async (tx) => {
    const [copy] = await tx
      .insert(quotations)
      .values({
        number: tempNumber("QUO"),
        customerId: source.customerId,
        createdBy: session.userId,
        templateId: source.templateId,
        status: "DRAFT",
        paymentTerms: source.paymentTerms,
        currency: source.currency,
        notes: source.notes,
        termsAndConditions: source.termsAndConditions,
        subtotal: source.subtotal,
        discountTotal: source.discountTotal,
        taxTotal: source.taxTotal,
        grandTotal: source.grandTotal,
      })
      .returning();

    const [withNumber] = await tx.update(quotations).set({ number: finalNumber("QUO", copy.id) }).where(eq(quotations.id, copy.id)).returning();

    if (sourceLines.length > 0) {
      await tx.insert(quotationLines).values(
        sourceLines.map((l) => ({
          quotationId: copy.id,
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
          subtotal: l.subtotal,
          lineTotal: l.lineTotal,
          description: l.description,
        }))
      );
    }

    await logAudit(tx, { userId: session.userId, action: "CREATED", entityType: "quotation", entityId: copy.id, newValues: { number: withNumber.number, duplicatedFrom: quotationId } });
    return withNumber;
  });

  return NextResponse.json({ quotation: result }, { status: 201 });
}
