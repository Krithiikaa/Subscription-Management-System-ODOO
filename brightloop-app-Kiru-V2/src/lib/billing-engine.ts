import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, subscriptionLines, invoices, invoiceLines } from "@/db/schema";
import { tempNumber, finalNumber } from "@/lib/numbering";
import { logAudit } from "@/lib/audit";
import { advanceBillingDate } from "@/lib/utils";
import { toPaise, fromPaise, addPaise, mulPaiseByInt } from "@/lib/money";

type SubscriptionRow = typeof subscriptions.$inferSelect;
type SubscriptionLineRow = typeof subscriptionLines.$inferSelect;

// ─── Pure helpers (no DB) ─────────────────────────────────────────────────

export function computeInvoiceTotals(
  lines: Pick<SubscriptionLineRow, "unitPrice" | "variantExtra" | "quantity" | "taxAmount" | "discountAmount" | "amount">[]
) {
  let subtotalPaise = 0n;
  let taxPaise = 0n;
  let discountPaise = 0n;
  let totalPaise = 0n;
  for (const l of lines) {
    const unitAndExtra = addPaise(toPaise(l.unitPrice), toPaise(l.variantExtra));
    subtotalPaise = addPaise(subtotalPaise, mulPaiseByInt(unitAndExtra, l.quantity));
    taxPaise = addPaise(taxPaise, toPaise(l.taxAmount));
    discountPaise = addPaise(discountPaise, toPaise(l.discountAmount));
    totalPaise = addPaise(totalPaise, toPaise(l.amount));
  }
  return {
    subtotal: fromPaise(subtotalPaise),
    taxAmount: fromPaise(taxPaise),
    discountAmount: fromPaise(discountPaise),
    total: fromPaise(totalPaise),
  };
}

export function deriveDueDate(issueDate: string, days = 14): string {
  const d = new Date(`${issueDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isInvoiceOverdue(
  invoice: { status: string; dueDate: string | null; total: string; amountPaid: string },
  now: Date = new Date()
): boolean {
  if (invoice.status !== "CONFIRMED" && invoice.status !== "PARTIALLY_PAID") return false;
  if (!invoice.dueDate) return false;
  const outstanding = toPaise(invoice.total) - toPaise(invoice.amountPaid);
  if (outstanding <= 0n) return false;
  const today = now.toISOString().slice(0, 10);
  return invoice.dueDate < today;
}

function minNextBillingDate(periodStart: string, lines: SubscriptionLineRow[]): string {
  const dates = lines.map((l) => advanceBillingDate(new Date(`${periodStart}T00:00:00Z`), l.billingPeriod ?? "MONTHLY").toISOString().slice(0, 10));
  return dates.reduce((min, d) => (d < min ? d : min));
}

// ─── DB-touching engine ───────────────────────────────────────────────────

export async function getDueSubscriptions(asOf: Date, limit: number, offset: number): Promise<SubscriptionRow[]> {
  const asOfStr = asOf.toISOString().slice(0, 10);
  return db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.status, "ACTIVE"), lte(subscriptions.nextBillingDate, asOfStr)))
    .limit(limit)
    .offset(offset);
}

export type BillingResult =
  | { subscriptionId: number; status: "created"; invoiceId: number; invoiceNumber: string; total: string }
  | { subscriptionId: number; status: "skipped"; reason: string }
  | { subscriptionId: number; status: "failed"; reason: string };

// One transaction per subscription — a single failure can never block or
// roll back the rest of the batch.
export async function generateInvoiceForSubscription(subscription: SubscriptionRow): Promise<BillingResult> {
  if (!subscription.nextBillingDate) {
    return { subscriptionId: subscription.id, status: "skipped", reason: "no nextBillingDate set" };
  }
  const periodStart = subscription.nextBillingDate;

  try {
    const result = await db.transaction(async (tx) => {
      const lines = await tx.select().from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, subscription.id));
      if (lines.length === 0) {
        return { subscriptionId: subscription.id, status: "skipped" as const, reason: "subscription has no lines" };
      }

      const totals = computeInvoiceTotals(lines);
      const issueDate = new Date().toISOString().slice(0, 10);
      const periodEnd = new Date(new Date(`${minNextBillingDate(periodStart, lines)}T00:00:00Z`).getTime() - 86_400_000)
        .toISOString()
        .slice(0, 10);

      // The DB-level unique index on (subscriptionId, periodStart) is the
      // real idempotency guard: two concurrent runs racing on the same
      // subscription/period can only ever have one insert succeed.
      const [invoice] = await tx
        .insert(invoices)
        .values({
          number: tempNumber("INV"),
          subscriptionId: subscription.id,
          customerId: subscription.customerId,
          status: "CONFIRMED",
          periodStart,
          periodEnd,
          dueDate: deriveDueDate(issueDate),
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          discountAmount: totals.discountAmount,
          total: totals.total,
        })
        .onConflictDoNothing({ target: [invoices.subscriptionId, invoices.periodStart] })
        .returning();

      if (!invoice) {
        return { subscriptionId: subscription.id, status: "skipped" as const, reason: "already invoiced for this period" };
      }

      const [withNumber] = await tx
        .update(invoices)
        .set({ number: finalNumber("INV", invoice.id) })
        .where(eq(invoices.id, invoice.id))
        .returning();

      await tx.insert(invoiceLines).values(
        lines.map((l) => ({
          invoiceId: invoice.id,
          productId: l.productId,
          variantId: l.variantId,
          planId: l.planId,
          productName: l.productName,
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
          lineTotal: l.amount,
        }))
      );

      const nextBillingDate = minNextBillingDate(periodStart, lines);

      // Conditional on the *old* cursor value — belt-and-suspenders on top of
      // the unique index above, in case the cursor was advanced by something
      // else between the select and this update.
      const [advanced] = await tx
        .update(subscriptions)
        .set({ nextBillingDate, updatedAt: new Date() })
        .where(and(eq(subscriptions.id, subscription.id), eq(subscriptions.nextBillingDate, periodStart)))
        .returning();
      if (!advanced) throw new Error("Concurrent billing conflict advancing nextBillingDate");

      await logAudit(tx, {
        userId: null,
        action: "CREATED",
        entityType: "invoice",
        entityId: invoice.id,
        newValues: { number: withNumber.number, subscriptionId: subscription.id, total: totals.total, periodStart, periodEnd },
      });
      await logAudit(tx, {
        userId: null,
        action: "UPDATED",
        entityType: "subscription",
        entityId: subscription.id,
        oldValues: { nextBillingDate: periodStart },
        newValues: { nextBillingDate },
      });

      return { subscriptionId: subscription.id, status: "created" as const, invoiceId: invoice.id, invoiceNumber: withNumber.number, total: totals.total };
    });
    return result;
  } catch (err) {
    return { subscriptionId: subscription.id, status: "failed", reason: err instanceof Error ? err.message : "unknown error" };
  }
}

export type BillingRunSummary =
  | { dryRun: true; count: number; previews: { subscriptionId: number; total: string }[] }
  | { dryRun: false; created: number; skipped: number; failed: number; results: BillingResult[] };

export async function runBillingCycle(asOf: Date, opts: { dryRun?: boolean; limit?: number } = {}): Promise<BillingRunSummary> {
  const pageSize = 100;
  const hardCap = opts.limit ?? 2000;
  let offset = 0;
  const results: BillingResult[] = [];
  const previews: { subscriptionId: number; total: string }[] = [];

  while (results.length + previews.length < hardCap) {
    const batch = await getDueSubscriptions(asOf, pageSize, offset);
    if (batch.length === 0) break;
    offset += batch.length;

    for (const sub of batch) {
      if (opts.dryRun) {
        const lines = await db.select().from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, sub.id));
        if (lines.length === 0) continue;
        previews.push({ subscriptionId: sub.id, total: computeInvoiceTotals(lines).total });
      } else {
        results.push(await generateInvoiceForSubscription(sub));
      }
    }
    if (batch.length < pageSize) break;
  }

  if (opts.dryRun) return { dryRun: true, count: previews.length, previews };
  return {
    dryRun: false,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };
}
