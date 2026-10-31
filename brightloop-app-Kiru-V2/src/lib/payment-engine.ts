import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Tx } from "@/db";
import { invoices, paymentSessions, payments } from "@/db/schema";
import { toPaise, fromPaise, addPaise } from "@/lib/money";
import { logAudit } from "@/lib/audit";

// ─── Pure helpers (no DB) ─────────────────────────────────────────────────

export function computeOutstanding(total: string, amountPaid: string): string {
  const outstanding = toPaise(total) - toPaise(amountPaid);
  return fromPaise(outstanding < 0n ? 0n : outstanding);
}

export function deriveInvoiceStatusAfterPayment(total: string, amountPaid: string): "PARTIALLY_PAID" | "PAID" {
  return toPaise(amountPaid) >= toPaise(total) ? "PAID" : "PARTIALLY_PAID";
}

export function isSessionExpired(expiresAt: Date | string, now: Date = new Date()): boolean {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return now.getTime() > expiry.getTime();
}

export function validatePaymentAmount(amount: string, outstanding: string): { valid: boolean; reason?: string } {
  const amountPaise = toPaise(amount);
  const outstandingPaise = toPaise(outstanding);
  if (amountPaise <= 0n) return { valid: false, reason: "Payment amount must be greater than zero" };
  if (amountPaise > outstandingPaise) return { valid: false, reason: "Payment amount cannot exceed the outstanding balance" };
  return { valid: true };
}

// ─── DB-touching engine ───────────────────────────────────────────────────

const SESSION_TTL_MS = 15 * 60 * 1000;

export class PaymentEngineError extends Error {}

export async function createPaymentSession(tx: Tx, params: { invoiceId: number; customerId: number }) {
  const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, params.invoiceId)).limit(1);
  if (!invoice) throw new PaymentEngineError("Invoice not found");
  if (invoice.customerId !== params.customerId) throw new PaymentEngineError("You do not own this invoice");
  if (invoice.status !== "CONFIRMED" && invoice.status !== "PARTIALLY_PAID") {
    throw new PaymentEngineError(`Invoice cannot be paid in its current status (${invoice.status})`);
  }

  const outstanding = computeOutstanding(invoice.total, invoice.amountPaid);
  if (toPaise(outstanding) <= 0n) throw new PaymentEngineError("This invoice has no outstanding balance");

  const now = new Date();
  const [session] = await tx
    .insert(paymentSessions)
    .values({
      sessionRef: nanoid(),
      invoiceId: invoice.id,
      customerId: params.customerId,
      amount: outstanding,
      status: "PENDING",
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    })
    .returning();

  return { session, invoice };
}

export type CompletePaymentOutcome = "SUCCESS" | "FAILURE" | "PENDING";

export type CompletePaymentResult =
  | { result: "expired" }
  | { result: "already_processed"; session: typeof paymentSessions.$inferSelect }
  | { result: "already_settled" }
  | { result: "failed"; payment: typeof payments.$inferSelect }
  | { result: "pending"; payment: typeof payments.$inferSelect }
  | { result: "success"; payment: typeof payments.$inferSelect; invoice: typeof invoices.$inferSelect };

export async function completePaymentSession(
  tx: Tx,
  sessionRef: string,
  params: { method: string; outcome: CompletePaymentOutcome }
): Promise<CompletePaymentResult> {
  const [existing] = await tx.select().from(paymentSessions).where(eq(paymentSessions.sessionRef, sessionRef)).limit(1);
  if (!existing) throw new PaymentEngineError("Payment session not found");

  if (existing.status !== "PENDING") {
    // Idempotent re-submit: a session that's already EXPIRED/COMPLETED/CANCELLED
    // is reported back as-is rather than reprocessed.
    if (existing.status === "EXPIRED") return { result: "expired" };
    return { result: "already_processed", session: existing };
  }

  if (isSessionExpired(existing.expiresAt)) {
    await tx
      .update(paymentSessions)
      .set({ status: "EXPIRED" })
      .where(and(eq(paymentSessions.id, existing.id), eq(paymentSessions.status, "PENDING")));
    return { result: "expired" };
  }

  // Atomic claim — mirrors the UPDATE ... WHERE status = 'SENT' pattern used
  // for quotation accept/reject, so a double-submit can only ever claim once.
  const [claimed] = await tx
    .update(paymentSessions)
    .set({ status: "COMPLETED", completedAt: new Date() })
    .where(and(eq(paymentSessions.id, existing.id), eq(paymentSessions.status, "PENDING")))
    .returning();
  if (!claimed) {
    const [refetched] = await tx.select().from(paymentSessions).where(eq(paymentSessions.id, existing.id)).limit(1);
    return { result: "already_processed", session: refetched ?? existing };
  }

  const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, claimed.invoiceId)).limit(1);
  if (!invoice) throw new PaymentEngineError("Invoice not found for this session");

  if (params.outcome === "FAILURE") {
    const [payment] = await tx
      .insert(payments)
      .values({
        invoiceId: invoice.id,
        customerId: claimed.customerId,
        amount: claimed.amount,
        method: params.method as (typeof payments.$inferInsert)["method"],
        status: "FAILED",
        paidOn: new Date().toISOString().slice(0, 10),
        sessionId: claimed.id,
        failureReason: "Simulated demo payment failure",
      })
      .returning();
    await logAudit(tx, { userId: null, action: "CREATED", entityType: "payment", entityId: payment.id, newValues: { status: "FAILED", invoiceId: invoice.id } });
    return { result: "failed", payment };
  }

  if (params.outcome === "PENDING") {
    const [payment] = await tx
      .insert(payments)
      .values({
        invoiceId: invoice.id,
        customerId: claimed.customerId,
        amount: claimed.amount,
        method: params.method as (typeof payments.$inferInsert)["method"],
        status: "PENDING",
        paidOn: new Date().toISOString().slice(0, 10),
        sessionId: claimed.id,
      })
      .returning();
    await logAudit(tx, { userId: null, action: "CREATED", entityType: "payment", entityId: payment.id, newValues: { status: "PENDING", invoiceId: invoice.id } });
    return { result: "pending", payment };
  }

  // SUCCESS — re-check the invoice's LIVE outstanding balance before applying
  // this payment. The session's amount was only a snapshot at creation time;
  // another session or a manual payment on the same invoice may have settled
  // it (fully or partially) in the meantime. Capping here, rather than
  // trusting the stale snapshot, is what keeps the DB's
  // amountPaid <= total check constraint from ever being the only thing
  // standing between this and an overpayment.
  const liveOutstanding = toPaise(computeOutstanding(invoice.total, invoice.amountPaid));
  if (liveOutstanding <= 0n) {
    return { result: "already_settled" };
  }
  const settleAmount = fromPaise(liveOutstanding < toPaise(claimed.amount) ? liveOutstanding : toPaise(claimed.amount));

  const [payment] = await tx
    .insert(payments)
    .values({
      invoiceId: invoice.id,
      customerId: claimed.customerId,
      amount: settleAmount,
      method: params.method as (typeof payments.$inferInsert)["method"],
      status: "SUCCESS",
      paidOn: new Date().toISOString().slice(0, 10),
      sessionId: claimed.id,
      transactionRef: nanoid(),
    })
    .returning();

  const newAmountPaid = fromPaise(addPaise(toPaise(invoice.amountPaid), toPaise(payment.amount)));
  const newStatus = deriveInvoiceStatusAfterPayment(invoice.total, newAmountPaid);

  const [updatedInvoice] = await tx
    .update(invoices)
    .set({ amountPaid: newAmountPaid, status: newStatus, updatedAt: new Date() })
    .where(eq(invoices.id, invoice.id))
    .returning();

  await tx.update(paymentSessions).set({ completedPaymentId: payment.id }).where(eq(paymentSessions.id, claimed.id));

  await logAudit(tx, { userId: null, action: "CREATED", entityType: "payment", entityId: payment.id, newValues: { status: "SUCCESS", invoiceId: invoice.id, amount: payment.amount } });
  await logAudit(tx, { userId: null, action: "STATUS_CHANGED", entityType: "invoice", entityId: invoice.id, oldValues: { status: invoice.status, amountPaid: invoice.amountPaid }, newValues: { status: newStatus, amountPaid: newAmountPaid } });

  return { result: "success", payment, invoice: updatedInvoice };
}

export async function recordManualPayment(
  tx: Tx,
  params: { invoiceId: number; amount: string; method: string; paidOn: string; note?: string; reference?: string; recordedByUserId: number }
) {
  const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, params.invoiceId)).limit(1);
  if (!invoice) throw new PaymentEngineError("Invoice not found");
  if (invoice.status !== "CONFIRMED" && invoice.status !== "PARTIALLY_PAID") {
    throw new PaymentEngineError(`Invoice cannot accept payment in its current status (${invoice.status})`);
  }

  const outstanding = computeOutstanding(invoice.total, invoice.amountPaid);
  const check = validatePaymentAmount(params.amount, outstanding);
  if (!check.valid) throw new PaymentEngineError(check.reason ?? "Invalid payment amount");

  const [payment] = await tx
    .insert(payments)
    .values({
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: params.amount,
      method: params.method as (typeof payments.$inferInsert)["method"],
      status: "SUCCESS",
      paidOn: params.paidOn,
      note: params.note,
      idempotencyKey: params.reference,
      recordedBy: params.recordedByUserId,
    })
    .returning();

  const newAmountPaid = fromPaise(addPaise(toPaise(invoice.amountPaid), toPaise(payment.amount)));
  const newStatus = deriveInvoiceStatusAfterPayment(invoice.total, newAmountPaid);

  const [updatedInvoice] = await tx
    .update(invoices)
    .set({ amountPaid: newAmountPaid, status: newStatus, updatedAt: new Date() })
    .where(eq(invoices.id, invoice.id))
    .returning();

  await logAudit(tx, { userId: params.recordedByUserId, action: "CREATED", entityType: "payment", entityId: payment.id, newValues: { status: "SUCCESS", invoiceId: invoice.id, amount: payment.amount, manual: true } });
  await logAudit(tx, { userId: params.recordedByUserId, action: "STATUS_CHANGED", entityType: "invoice", entityId: invoice.id, oldValues: { status: invoice.status, amountPaid: invoice.amountPaid }, newValues: { status: newStatus, amountPaid: newAmountPaid } });

  return { payment, invoice: updatedInvoice };
}
