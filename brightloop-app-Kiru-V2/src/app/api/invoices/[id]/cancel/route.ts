import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, invoiceLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { getStaffProductIds } from "@/lib/staff-access";
import { cancelInvoiceSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId)) return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = cancelInvoiceSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (session.role === "STAFF") {
    const lines = await db.select({ productId: invoiceLines.productId }).from(invoiceLines).where(eq(invoiceLines.invoiceId, invoiceId));
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const isInvolved = lines.some((l) => staffProductIds.has(l.productId));
    if (!isInvolved) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only a fully-unpaid CONFIRMED invoice can be cancelled — cancelling a
  // partially-paid or paid invoice would require an un-invented refund
  // policy, which this system deliberately does not provide.
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(invoices)
      .set({ status: "CANCELLED", cancelReason: parsed.data.reason ?? null, cancelledAt: new Date(), cancelledBy: session.userId, updatedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.status, "CONFIRMED")))
      .returning();
    if (row) {
      await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "invoice", entityId: invoiceId, oldValues: { status: "CONFIRMED" }, newValues: { status: "CANCELLED", reason: parsed.data.reason ?? null } });
    }
    return row;
  });

  if (!updated) {
    return NextResponse.json({ error: `Invoice cannot be cancelled from status ${invoice.status}` }, { status: 409 });
  }

  return NextResponse.json({ invoice: updated });
}
