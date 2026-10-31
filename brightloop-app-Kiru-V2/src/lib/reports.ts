import { and, eq, gte, lte, inArray, sql, count } from "drizzle-orm";
import type { Db } from "@/db";
import {
  customers,
  products,
  subscriptions,
  subscriptionLines,
  invoices,
  invoiceLines,
  payments,
  quotations,
  softwareEntitlements,
} from "@/db/schema";
import { getStaffProductIds } from "@/lib/staff-access";
import { isInvoiceOverdue } from "@/lib/billing-engine";
import { toPaise, fromPaise, addPaise } from "@/lib/money";

export type DateRange = { from: string; to: string } | null;

const MONTHLY_FACTOR: Record<string, number> = {
  DAILY: 30.44,
  WEEKLY: 4.345,
  MONTHLY: 1,
  YEARLY: 1 / 12,
};

function sumMoney(rows: { amount: string }[]): string {
  let total = 0n;
  for (const r of rows) total = addPaise(total, toPaise(r.amount));
  return fromPaise(total);
}

export type AdminStaffDashboardStats = {
  totalCustomers: number;
  totalProducts: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  renewedSubscriptions: number;
  cancelledSubscriptions: number;
  totalInvoices: number;
  paidInvoices: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalRevenueCollected: string;
  outstandingRevenue: string;
  mrr: string;
  arr: string;
  series: {
    revenueTrend: { date: string; amount: string }[];
    subscriptionGrowth: { date: string; count: number }[];
    productWiseSubscriptions: { productName: string; count: number }[];
    invoiceStatusDistribution: { status: string; count: number }[];
    paymentStatusDistribution: { status: string; count: number }[];
  };
};

export type CustomerDashboardStats = {
  activeSubscriptions: number;
  pendingQuotations: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalPaymentsMade: string;
  upcomingRenewals: { subscriptionNumber: string; nextBillingDate: string }[];
  softwareAccessSummary: { active: number; total: number };
};

export async function getDashboardStats(
  db: Db,
  params: { role: "ADMIN" | "STAFF" | "CUSTOMER"; staffId?: number; customerId?: number; range: DateRange }
): Promise<AdminStaffDashboardStats | CustomerDashboardStats> {
  if (params.role === "CUSTOMER") {
    if (!params.customerId) {
      return {
        activeSubscriptions: 0,
        pendingQuotations: 0,
        outstandingInvoices: 0,
        overdueInvoices: 0,
        totalPaymentsMade: "0.00",
        upcomingRenewals: [],
        softwareAccessSummary: { active: 0, total: 0 },
      };
    }
    return getCustomerStats(db, params.customerId, params.range);
  }
  return getAdminStaffStats(db, params.role, params.staffId, params.range);
}

// ─── Admin / Staff ──────────────────────────────────────────────────────────

async function getAdminStaffStats(db: Db, role: "ADMIN" | "STAFF", staffId: number | undefined, range: DateRange): Promise<AdminStaffDashboardStats> {
  const productFilter = role === "STAFF" && staffId ? await getStaffProductIds(db, staffId) : null;

  // STAFF with zero assigned products sees an all-zero dashboard — no implicit access.
  if (productFilter && productFilter.length === 0) {
    return emptyAdminStaffStats();
  }

  const scopedSubscriptionIds = productFilter
    ? [
        ...new Set(
          (
            await db
              .select({ id: subscriptionLines.subscriptionId })
              .from(subscriptionLines)
              .where(inArray(subscriptionLines.productId, productFilter))
          ).map((r) => r.id)
        ),
      ]
    : null;

  const scopedInvoiceIds = productFilter
    ? [
        ...new Set(
          (
            await db
              .select({ id: invoiceLines.invoiceId })
              .from(invoiceLines)
              .where(inArray(invoiceLines.productId, productFilter))
          ).map((r) => r.id)
        ),
      ]
    : null;

  if (scopedSubscriptionIds && scopedSubscriptionIds.length === 0 && scopedInvoiceIds && scopedInvoiceIds.length === 0) {
    return emptyAdminStaffStats();
  }

  const subFilter = scopedSubscriptionIds ? inArray(subscriptions.id, scopedSubscriptionIds.length ? scopedSubscriptionIds : [-1]) : undefined;
  const invFilter = scopedInvoiceIds ? inArray(invoices.id, scopedInvoiceIds.length ? scopedInvoiceIds : [-1]) : undefined;

  const rangeFilterSub = range ? and(gte(subscriptions.createdAt, new Date(range.from)), lte(subscriptions.createdAt, new Date(`${range.to}T23:59:59Z`))) : undefined;
  const rangeFilterClosed = range ? and(gte(subscriptions.closedAt, new Date(range.from)), lte(subscriptions.closedAt, new Date(`${range.to}T23:59:59Z`))) : undefined;
  const rangeFilterPay = range ? and(gte(payments.paidOn, range.from), lte(payments.paidOn, range.to)) : undefined;

  const [totalCustomersRow] = productFilter
    ? await db
        .select({ n: sql<number>`count(distinct ${subscriptions.customerId})` })
        .from(subscriptions)
        .where(subFilter)
    : await db.select({ n: count() }).from(customers);

  const [totalProductsRow] = productFilter
    ? [{ n: productFilter.length }]
    : await db.select({ n: count() }).from(products);

  const [activeSubsRow] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(subFilter ? and(eq(subscriptions.status, "ACTIVE"), subFilter) : eq(subscriptions.status, "ACTIVE"));

  const [newSubsRow] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(subFilter && rangeFilterSub ? and(subFilter, rangeFilterSub) : subFilter ?? rangeFilterSub);

  const [renewedSubsRow] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(
      and(
        sql`${subscriptions.renewedFromSubscriptionId} IS NOT NULL`,
        ...(subFilter ? [subFilter] : []),
        ...(rangeFilterSub ? [rangeFilterSub] : [])
      )
    );

  const [cancelledSubsRow] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "CLOSED"),
        ...(subFilter ? [subFilter] : []),
        ...(rangeFilterClosed ? [rangeFilterClosed] : [])
      )
    );

  const [totalInvoicesRow] = await db.select({ n: count() }).from(invoices).where(invFilter);
  const [paidInvoicesRow] = await db
    .select({ n: count() })
    .from(invoices)
    .where(invFilter ? and(eq(invoices.status, "PAID"), invFilter) : eq(invoices.status, "PAID"));
  const outstandingStatusFilter = sql`${invoices.status} IN ('CONFIRMED','PARTIALLY_PAID')`;
  const [outstandingInvoicesRow] = await db
    .select({ n: count() })
    .from(invoices)
    .where(invFilter ? and(outstandingStatusFilter, invFilter) : outstandingStatusFilter);

  const candidateOutstandingInvoices = await db
    .select({ status: invoices.status, dueDate: invoices.dueDate, total: invoices.total, amountPaid: invoices.amountPaid })
    .from(invoices)
    .where(invFilter ? and(outstandingStatusFilter, invFilter) : outstandingStatusFilter);
  const overdueInvoicesCount = candidateOutstandingInvoices.filter((inv) => isInvoiceOverdue(inv)).length;
  const outstandingRevenue = sumMoney(
    candidateOutstandingInvoices.map((inv) => ({ amount: fromPaise(toPaise(inv.total) - toPaise(inv.amountPaid)) }))
  );

  // Revenue collected — successful payments only, scoped to this role's
  // invoices via the invoiceId set, and to the selected date range.
  let paymentRows: { amount: string; paidOn: string; status: string }[];
  if (scopedInvoiceIds) {
    paymentRows = await db
      .select({ amount: payments.amount, paidOn: payments.paidOn, status: payments.status })
      .from(payments)
      .where(and(inArray(payments.invoiceId, scopedInvoiceIds.length ? scopedInvoiceIds : [-1]), rangeFilterPay ?? sql`true`));
  } else {
    paymentRows = await db
      .select({ amount: payments.amount, paidOn: payments.paidOn, status: payments.status })
      .from(payments)
      .where(rangeFilterPay);
  }
  const totalRevenueCollected = sumMoney(paymentRows.filter((p) => p.status === "SUCCESS"));

  // Revenue trend — daily buckets of successful payments within range.
  const revenueByDay = new Map<string, bigint>();
  for (const p of paymentRows) {
    if (p.status !== "SUCCESS") continue;
    revenueByDay.set(p.paidOn, addPaise(revenueByDay.get(p.paidOn) ?? 0n, toPaise(p.amount)));
  }
  const revenueTrend = [...revenueByDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, paise]) => ({ date, amount: fromPaise(paise) }));

  const paymentStatusCounts = new Map<string, number>();
  for (const p of paymentRows) paymentStatusCounts.set(p.status, (paymentStatusCounts.get(p.status) ?? 0) + 1);
  const paymentStatusDistribution = [...paymentStatusCounts.entries()].map(([status, c]) => ({ status, count: c }));

  const invoiceStatusRows = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(invFilter);
  const invoiceStatusCounts = new Map<string, number>();
  for (const r of invoiceStatusRows) invoiceStatusCounts.set(r.status, (invoiceStatusCounts.get(r.status) ?? 0) + 1);
  const invoiceStatusDistribution = [...invoiceStatusCounts.entries()].map(([status, c]) => ({ status, count: c }));

  // Subscription growth — new ACTIVE-or-ever-created subscriptions per day in range.
  const growthRows = await db
    .select({ createdAt: subscriptions.createdAt })
    .from(subscriptions)
    .where(subFilter && rangeFilterSub ? and(subFilter, rangeFilterSub) : subFilter ?? rangeFilterSub);
  const growthByDay = new Map<string, number>();
  for (const r of growthRows) {
    const day = r.createdAt.toISOString().slice(0, 10);
    growthByDay.set(day, (growthByDay.get(day) ?? 0) + 1);
  }
  const subscriptionGrowth = [...growthByDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, c]) => ({ date, count: c }));

  // MRR/ARR — current run-rate from ACTIVE subscriptions' line snapshots,
  // deliberately NOT filtered by the selected date range (these describe
  // "right now", unlike the time-bound metrics above).
  const activeLineRows = await db
    .select({ productId: subscriptionLines.productId, productName: subscriptionLines.productName, billingPeriod: subscriptionLines.billingPeriod, amount: subscriptionLines.amount })
    .from(subscriptionLines)
    .innerJoin(subscriptions, eq(subscriptions.id, subscriptionLines.subscriptionId))
    .where(
      productFilter
        ? and(eq(subscriptions.status, "ACTIVE"), inArray(subscriptionLines.productId, productFilter))
        : eq(subscriptions.status, "ACTIVE")
    );

  let mrrPaise = 0n;
  const productCounts = new Map<string, number>();
  for (const line of activeLineRows) {
    const factor = MONTHLY_FACTOR[line.billingPeriod ?? "MONTHLY"] ?? 1;
    const monthlyPaise = BigInt(Math.round(Number(toPaise(line.amount)) * factor));
    mrrPaise = addPaise(mrrPaise, monthlyPaise);
    const name = line.productName ?? `Product #${line.productId}`;
    productCounts.set(name, (productCounts.get(name) ?? 0) + 1);
  }
  const mrr = fromPaise(mrrPaise);
  const arr = fromPaise(mrrPaise * 12n);
  const productWiseSubscriptions = [...productCounts.entries()].map(([productName, c]) => ({ productName, count: c }));

  return {
    totalCustomers: Number(totalCustomersRow?.n ?? 0),
    totalProducts: Number(totalProductsRow?.n ?? 0),
    activeSubscriptions: Number(activeSubsRow?.n ?? 0),
    newSubscriptions: Number(newSubsRow?.n ?? 0),
    renewedSubscriptions: Number(renewedSubsRow?.n ?? 0),
    cancelledSubscriptions: Number(cancelledSubsRow?.n ?? 0),
    totalInvoices: Number(totalInvoicesRow?.n ?? 0),
    paidInvoices: Number(paidInvoicesRow?.n ?? 0),
    outstandingInvoices: Number(outstandingInvoicesRow?.n ?? 0),
    overdueInvoices: overdueInvoicesCount,
    totalRevenueCollected,
    outstandingRevenue,
    mrr,
    arr,
    series: { revenueTrend, subscriptionGrowth, productWiseSubscriptions, invoiceStatusDistribution, paymentStatusDistribution },
  };
}

function emptyAdminStaffStats(): AdminStaffDashboardStats {
  return {
    totalCustomers: 0,
    totalProducts: 0,
    activeSubscriptions: 0,
    newSubscriptions: 0,
    renewedSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    outstandingInvoices: 0,
    overdueInvoices: 0,
    totalRevenueCollected: "0.00",
    outstandingRevenue: "0.00",
    mrr: "0.00",
    arr: "0.00",
    series: { revenueTrend: [], subscriptionGrowth: [], productWiseSubscriptions: [], invoiceStatusDistribution: [], paymentStatusDistribution: [] },
  };
}

// ─── Customer ───────────────────────────────────────────────────────────────

async function getCustomerStats(db: Db, customerId: number, range: DateRange): Promise<CustomerDashboardStats> {
  void range; // customer dashboard shows current-state snapshots only, no date filter

  const [activeSubsRow] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(and(eq(subscriptions.customerId, customerId), eq(subscriptions.status, "ACTIVE")));

  const [pendingQuotationsRow] = await db
    .select({ n: count() })
    .from(quotations)
    .where(and(eq(quotations.customerId, customerId), eq(quotations.status, "SENT")));

  const outstandingStatusFilter = sql`${invoices.status} IN ('CONFIRMED','PARTIALLY_PAID')`;
  const outstandingInvoiceRows = await db
    .select({ status: invoices.status, dueDate: invoices.dueDate, total: invoices.total, amountPaid: invoices.amountPaid })
    .from(invoices)
    .where(and(eq(invoices.customerId, customerId), outstandingStatusFilter));
  const overdueInvoices = outstandingInvoiceRows.filter((inv) => isInvoiceOverdue(inv)).length;

  const paymentRows = await db
    .select({ amount: payments.amount, status: payments.status })
    .from(payments)
    .where(and(eq(payments.customerId, customerId), eq(payments.status, "SUCCESS")));
  const totalPaymentsMade = sumMoney(paymentRows);

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const renewalRows = await db
    .select({ number: subscriptions.number, nextBillingDate: subscriptions.nextBillingDate })
    .from(subscriptions)
    .where(and(eq(subscriptions.customerId, customerId), eq(subscriptions.status, "ACTIVE"), gte(subscriptions.nextBillingDate, today), lte(subscriptions.nextBillingDate, in30Days)));

  const entitlementRows = await db.select({ status: softwareEntitlements.status }).from(softwareEntitlements).where(eq(softwareEntitlements.customerId, customerId));

  return {
    activeSubscriptions: Number(activeSubsRow?.n ?? 0),
    pendingQuotations: Number(pendingQuotationsRow?.n ?? 0),
    outstandingInvoices: outstandingInvoiceRows.length,
    overdueInvoices,
    totalPaymentsMade,
    upcomingRenewals: renewalRows
      .filter((r): r is { number: string; nextBillingDate: string } => !!r.nextBillingDate)
      .map((r) => ({ subscriptionNumber: r.number, nextBillingDate: r.nextBillingDate })),
    softwareAccessSummary: { active: entitlementRows.filter((e) => e.status === "ACTIVE").length, total: entitlementRows.length },
  };
}
