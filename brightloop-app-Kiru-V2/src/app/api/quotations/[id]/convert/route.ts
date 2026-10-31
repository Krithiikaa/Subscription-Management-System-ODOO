import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { quotationLines, quotations, subscriptionLines, subscriptions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { isoDateSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { tempNumber, finalNumber } from "@/lib/numbering";
import { advanceBillingDate } from "@/lib/utils";

class AlreadyConverted extends Error {}

const convertSchema = z.object({
  startDate: isoDateSchema.optional(),
  expiryDate: isoDateSchema.optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = convertSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
  if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  if (quotation.convertedSubscriptionId) {
    const [existingSub] = await db.select().from(subscriptions).where(eq(subscriptions.id, quotation.convertedSubscriptionId)).limit(1);
    return NextResponse.json({ subscription: existingSub, alreadyConverted: true });
  }

  if (quotation.status !== "ACCEPTED") {
    return NextResponse.json({ error: `Only an ACCEPTED quotation can be converted (status: ${quotation.status})` }, { status: 409 });
  }

  const lines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
  if (session.role === "STAFF") {
    const allowed = await staffCanAccessAllProducts(db, session.userId, lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to convert a quotation containing one or more of these products" }, { status: 403 });
  }

  const startDate = parsed.data.startDate ?? new Date().toISOString().slice(0, 10);

  try {
    const result = await db.transaction(async (tx) => {
      const [sub] = await tx
        .insert(subscriptions)
        .values({
          number: tempNumber("SUB"),
          customerId: quotation.customerId,
          quotationId: quotation.id,
          createdBy: session.userId,
          status: "CONFIRMED",
          startDate,
          expiryDate: parsed.data.expiryDate,
          paymentTerms: quotation.paymentTerms,
          notes: quotation.notes,
        })
        .returning();

      const nextBillingDates = lines.map((l) => advanceBillingDate(new Date(startDate), l.billingPeriod).toISOString().slice(0, 10));
      const nextBillingDate = nextBillingDates.length > 0 ? nextBillingDates.reduce((min, d) => (d < min ? d : min)) : null;

      const [withNumber] = await tx
        .update(subscriptions)
        // planId mirrors the first line's plan — the customer portal joins on it.
        .set({ number: finalNumber("SUB", sub.id), nextBillingDate, planId: lines[0]?.planId })
        .where(eq(subscriptions.id, sub.id))
        .returning();

      await tx.insert(subscriptionLines).values(
        lines.map((l) => ({
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

      // Atomic claim — if another concurrent request already converted this
      // quotation, this returns no row and we roll back the subscription we
      // just inserted rather than leaving a duplicate/orphan behind.
      const [claimedQuotation] = await tx
        .update(quotations)
        .set({ convertedSubscriptionId: sub.id, updatedAt: new Date() })
        .where(and(eq(quotations.id, quotationId), isNull(quotations.convertedSubscriptionId)))
        .returning();
      if (!claimedQuotation) throw new AlreadyConverted();

      await logAudit(tx, { userId: session.userId, action: "CREATED", entityType: "subscription", entityId: sub.id, newValues: { number: withNumber.number, fromQuotationId: quotationId } });
      return { subscription: withNumber };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AlreadyConverted) {
      const [refetched] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
      const [existingSub] = refetched?.convertedSubscriptionId
        ? await db.select().from(subscriptions).where(eq(subscriptions.id, refetched.convertedSubscriptionId)).limit(1)
        : [];
      return NextResponse.json({ subscription: existingSub, alreadyConverted: true });
    }
    throw err;
  }
}
