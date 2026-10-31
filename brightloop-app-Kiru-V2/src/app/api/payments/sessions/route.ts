import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/db";
import { requireApiRole } from "@/lib/api-auth";
import { createPaymentSessionSchema } from "@/lib/validation";
import { createPaymentSession, PaymentEngineError } from "@/lib/payment-engine";

export async function POST(request: Request) {
  const auth = await requireApiRole("CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;
  if (!session.customerId) return NextResponse.json({ error: "No customer profile on this account" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createPaymentSessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  try {
    const { session: paymentSession } = await db.transaction((tx) =>
      createPaymentSession(tx, { invoiceId: parsed.data.invoiceId, customerId: session.customerId! })
    );

    const checkoutUrl = `${process.env.APP_URL ?? ""}/portal/checkout/${paymentSession.sessionRef}`;
    const qrDataUrl = await QRCode.toDataURL(checkoutUrl);

    return NextResponse.json({ session: paymentSession, qrDataUrl }, { status: 201 });
  } catch (err) {
    if (err instanceof PaymentEngineError) return NextResponse.json({ error: err.message }, { status: 409 });
    throw err;
  }
}
