import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { isQuotationExpired, isValidQuotationTransition } from "@/lib/quotation-lifecycle";
import { rejectQuotationSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = rejectQuotationSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
  if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  if (quotation.customerId !== session.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isValidQuotationTransition(quotation.status, "REJECTED")) {
    return NextResponse.json({ error: `This quotation cannot be rejected (status: ${quotation.status})` }, { status: 409 });
  }
  if (isQuotationExpired(quotation.validUntil)) {
    return NextResponse.json({ error: "This quotation has already expired" }, { status: 409 });
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(quotations)
      .set({ status: "REJECTED", rejectedAt: new Date(), rejectionReason: parsed.data.reason, updatedAt: new Date() })
      .where(and(eq(quotations.id, quotationId), eq(quotations.status, "SENT")))
      .returning();
    if (!row) return null;
    await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "quotation", entityId: quotationId, oldValues: { status: quotation.status }, newValues: { status: "REJECTED" } });
    return row;
  });

  if (!updated) return NextResponse.json({ error: "This quotation was already responded to" }, { status: 409 });
  return NextResponse.json({ quotation: updated });
}
