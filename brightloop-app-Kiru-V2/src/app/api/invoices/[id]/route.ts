import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, invoiceLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { getStaffProductIds } from "@/lib/staff-access";

async function loadInvoice(id: number) {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!invoice) return null;
  const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, id));
  return { invoice, lines };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId)) return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });

  const detail = await loadInvoice(invoiceId);
  if (!detail) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (session.role === "CUSTOMER" && detail.invoice.customerId !== session.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role === "STAFF") {
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const isInvolved = detail.lines.some((l) => staffProductIds.has(l.productId));
    if (!isInvolved) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(detail);
}
