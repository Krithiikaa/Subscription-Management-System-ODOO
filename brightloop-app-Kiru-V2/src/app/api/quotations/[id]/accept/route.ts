import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { isQuotationExpired, isValidQuotationTransition } from "@/lib/quotation-lifecycle";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
  if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  // Ownership is enforced here, not just by hiding the link — a customer
  // cannot accept another customer's quotation by guessing/modifying a URL.
  if (quotation.customerId !== session.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isValidQuotationTransition(quotation.status, "ACCEPTED")) {
    return NextResponse.json({ error: `This quotation cannot be accepted (status: ${quotation.status})` }, { status: 409 });
  }
  if (isQuotationExpired(quotation.validUntil)) {
    // Mark it EXPIRED rather than silently rejecting, so the record reflects why.
    await db.transaction(async (tx) => {
      await tx.update(quotations).set({ status: "EXPIRED", updatedAt: new Date() }).where(eq(quotations.id, quotationId));
      await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "quotation", entityId: quotationId, oldValues: { status: quotation.status }, newValues: { status: "EXPIRED" } });
    });
    return NextResponse.json({ error: "This quotation has expired and can no longer be accepted" }, { status: 409 });
  }

  const updated = await db.transaction(async (tx) => {
    // Conditional on status still being SENT — atomically prevents a second
    // concurrent accept/reject request from double-processing this quotation.
    const [row] = await tx
      .update(quotations)
      .set({ status: "ACCEPTED", acceptedAt: new Date(), acceptedBy: session.userId, updatedAt: new Date() })
      .where(and(eq(quotations.id, quotationId), eq(quotations.status, "SENT")))
      .returning();
    if (!row) return null;
    await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "quotation", entityId: quotationId, oldValues: { status: quotation.status }, newValues: { status: "ACCEPTED", acceptedBy: session.userId } });
    return row;
  });

  if (!updated) {
    return NextResponse.json({ error: "This quotation was already responded to" }, { status: 409 });
  }

  return NextResponse.json({ quotation: updated });
}
