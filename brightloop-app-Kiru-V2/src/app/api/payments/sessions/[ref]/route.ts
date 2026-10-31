import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { db } from "@/db";
import { paymentSessions, invoices } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { ref } = await params;
  const [paymentSession] = await db.select().from(paymentSessions).where(eq(paymentSessions.sessionRef, ref)).limit(1);
  if (!paymentSession) return NextResponse.json({ error: "Payment session not found" }, { status: 404 });

  if (session.role === "CUSTOMER" && paymentSession.customerId !== session.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [invoice] = await db
    .select({ id: invoices.id, number: invoices.number, total: invoices.total, amountPaid: invoices.amountPaid, status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, paymentSession.invoiceId))
    .limit(1);

  const checkoutUrl = `${process.env.APP_URL ?? ""}/portal/checkout/${paymentSession.sessionRef}`;
  const qrDataUrl = paymentSession.status === "PENDING" ? await QRCode.toDataURL(checkoutUrl) : null;

  return NextResponse.json({ session: paymentSession, invoice, qrDataUrl });
}
