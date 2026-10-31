import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentSessions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { completePaymentSessionSchema } from "@/lib/validation";
import { completePaymentSession, PaymentEngineError } from "@/lib/payment-engine";

export async function POST(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const auth = await requireApiRole("CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { ref } = await params;
  const [existing] = await db.select().from(paymentSessions).where(eq(paymentSessions.sessionRef, ref)).limit(1);
  if (!existing) return NextResponse.json({ error: "Payment session not found" }, { status: 404 });
  if (existing.customerId !== session.customerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = completePaymentSessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  try {
    const result = await db.transaction((tx) => completePaymentSession(tx, ref, parsed.data));
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PaymentEngineError) return NextResponse.json({ error: err.message }, { status: 409 });
    throw err;
  }
}
