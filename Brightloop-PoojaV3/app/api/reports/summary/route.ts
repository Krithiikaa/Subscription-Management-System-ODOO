import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { normalizeMRR } from "@/lib/reports/metrics";
import { BillingPeriod } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    // Execute SQL Aggregates ($queryRaw) for maximum performance under 2 seconds
    const [
      activeCountRes,
      revenueRes,
      invoicesAggregateRes,
      statusBreakdownRes,
      activeSubsWithPlan,
      overdueInvoices,
    ] = await Promise.all([
      // 1. Active subscriptions count
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "Subscription"
        WHERE "status" = 'ACTIVE'
      `,

      // 2. Revenue collected (sum of non-reversal payments)
      prisma.$queryRaw<Array<{ total: number | null }>>`
        SELECT COALESCE(SUM("amount"), 0)::float AS total
        FROM "Payment"
        WHERE "isReversal" = false
      `,

      // 3. Invoices aggregate: total invoiced & paid
      prisma.$queryRaw<Array<{ totalInvoiced: number | null }>>`
        SELECT COALESCE(SUM("grandTotal"), 0)::float AS totalInvoiced
        FROM "Invoice"
        WHERE "status" != 'CANCELLED'
      `,

      // 4. Subscriptions by status for Donut Chart
      prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
        SELECT "status", COUNT(*)::bigint AS count
        FROM "Subscription"
        GROUP BY "status"
      `,

      // 5. Active subscriptions for MRR normalization
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: {
          plan: { select: { billingPeriod: true } },
          lines: { select: { amount: true } },
        },
      }),

      // 6. Overdue Invoices: status = CONFIRMED, dueDate < NOW, balance > 0
      prisma.$queryRaw<
        Array<{
          id: string;
          number: string;
          customerName: string;
          grandTotal: number;
          paidAmount: number;
          dueDate: Date;
        }>
      >`
        SELECT
          i."id",
          i."number",
          u."name" AS "customerName",
          i."grandTotal"::float AS "grandTotal",
          COALESCE(p."paid", 0)::float AS "paidAmount",
          i."dueDate"
        FROM "Invoice" i
        JOIN "Customer" c ON i."customerId" = c."id"
        JOIN "User" u ON c."userId" = u."id"
        LEFT JOIN (
          SELECT "invoiceId", SUM("amount") AS "paid"
          FROM "Payment"
          WHERE "isReversal" = false
          GROUP BY "invoiceId"
        ) p ON i."id" = p."invoiceId"
        WHERE i."status" = 'CONFIRMED'
          AND i."dueDate" < NOW()
          AND (i."grandTotal" - COALESCE(p."paid", 0)) > 0
        ORDER BY i."dueDate" ASC
        LIMIT 10
      `,
    ]);

    const activeSubscriptions = Number(activeCountRes[0]?.count || 0);
    const revenueCollected = Number(revenueRes[0]?.total || 0);
    const totalInvoiced = Number(invoicesAggregateRes[0]?.totalInvoiced || 0);
    const outstanding = Math.max(0, totalInvoiced - revenueCollected);

    // Calculate normalized MRR
    let mrr = 0;
    for (const sub of activeSubsWithPlan) {
      const subTotal = sub.lines.reduce((acc, l) => acc + l.amount.toNumber(), 0);
      mrr += normalizeMRR(subTotal, sub.plan.billingPeriod as BillingPeriod);
    }
    mrr = Math.round(mrr * 100) / 100;

    // Overdue summary
    const formattedOverdue = overdueInvoices.map((inv) => {
      const balance = Math.max(0, inv.grandTotal - inv.paidAmount);
      const daysOverdue = Math.max(
        0,
        Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      return {
        id: inv.id,
        number: inv.number,
        customerName: inv.customerName,
        grandTotal: inv.grandTotal,
        balance,
        dueDate: inv.dueDate,
        daysOverdue,
      };
    });

    const overdueTotal = formattedOverdue.reduce((acc, inv) => acc + inv.balance, 0);

    // Subscriptions by status
    const statusDistribution = statusBreakdownRes.map((st) => ({
      status: st.status,
      count: Number(st.count),
    }));

    return NextResponse.json({
      kpis: {
        activeSubscriptions,
        revenueCollected,
        outstanding,
        overdueAmount: overdueTotal,
        mrr,
      },
      statusDistribution,
      overdueInvoices: formattedOverdue,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

