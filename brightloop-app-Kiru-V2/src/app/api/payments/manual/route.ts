import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoiceLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { recordManualPaymentSchema } from "@/lib/validation";
import { recordManualPayment, PaymentEngineError } from "@/lib/payment-engine";

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const body = await request.json().catch(() => null);
  const parsed = recordManualPaymentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  if (session.role === "STAFF") {
    const lines = await db.select({ productId: invoiceLines.productId }).from(invoiceLines).where(eq(invoiceLines.invoiceId, parsed.data.invoiceId));
    const allowed = await staffCanAccessAllProducts(db, session.userId, lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to record payments for this invoice" }, { status: 403 });
  }

  try {
    const result = await db.transaction((tx) => recordManualPayment(tx, { ...parsed.data, recordedByUserId: session.userId }));
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof PaymentEngineError) return NextResponse.json({ error: err.message }, { status: 409 });
    throw err;
  }
}
