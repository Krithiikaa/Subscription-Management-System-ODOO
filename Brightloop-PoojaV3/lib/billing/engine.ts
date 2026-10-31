import { prisma } from "@/lib/prisma";
import { advanceBillingDate, calculatePeriodEnd, calculateDueDate } from "@/lib/billing/dates";
import { selectBestDiscount, DiscountRule } from "@/lib/billing/discounts";
import { computeInvoiceTotals } from "@/lib/billing/taxes";
import { getNextSequenceNumber } from "@/lib/counters";

export interface BillingRunResult {
  created: number;
  skipped: number;
  failed: number;
  details: Array<{
    subscriptionNumber: string;
    invoiceNumber?: string;
    status: "CREATED" | "SKIPPED" | "FAILED" | "AUTO_CLOSED";
    error?: string;
  }>;
}

/**
 * Core Billing Engine.
 * Called by both /api/cron/billing and /api/admin/run-billing.
 */
export async function runBillingEngine(
  targetDate: Date = new Date(),
  batchSize: number = 100
): Promise<BillingRunResult> {
  const result: BillingRunResult = {
    created: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  // Find Active subscriptions with nextInvoiceDate <= targetDate
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextInvoiceDate: {
        lte: targetDate,
      },
    },
    include: {
      plan: true,
      customer: true,
      lines: {
        include: { product: true, variant: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    take: batchSize,
    orderBy: { nextInvoiceDate: "asc" },
  });

  // Fetch active discounts
  const rawDiscounts = await prisma.discount.findMany({
    where: { isActive: true },
    include: { discountProducts: true },
  });

  const availableDiscounts: DiscountRule[] = rawDiscounts.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    value: d.value.toNumber(),
    minAmount: d.minAmount ? d.minAmount.toNumber() : null,
    minQuantity: d.minQuantity,
    startDate: d.startDate,
    endDate: d.endDate,
    usageLimit: d.usageLimit,
    usageCount: d.usageCount,
    appliesToAll: d.appliesToAll,
    isActive: d.isActive,
    productIds: d.discountProducts.map((dp) => dp.productId),
  }));

  // Process each subscription independently in its own transaction
  for (const sub of dueSubscriptions) {
    try {
      // 1. Check autoClose rule
      if (sub.plan.autoClose && sub.expiryDate && new Date(sub.expiryDate) <= targetDate) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "CLOSED" },
        });
        result.skipped++;
        result.details.push({
          subscriptionNumber: sub.number,
          status: "AUTO_CLOSED",
        });
        continue;
      }

      // Check if past expiry
      if (sub.expiryDate && sub.nextInvoiceDate && new Date(sub.nextInvoiceDate) > new Date(sub.expiryDate)) {
        result.skipped++;
        result.details.push({
          subscriptionNumber: sub.number,
          status: "SKIPPED",
        });
        continue;
      }

      // Process all missed periods in chronological order
      let currentPeriodStart = new Date(sub.nextInvoiceDate!);

      while (currentPeriodStart <= targetDate) {
        if (sub.expiryDate && currentPeriodStart > new Date(sub.expiryDate)) {
          break;
        }

        const periodEnd = calculatePeriodEnd(currentPeriodStart, sub.plan.billingPeriod);
        const dueDate = calculateDueDate(currentPeriodStart, sub.paymentTerms);

        // Check if invoice already exists for this (subscriptionId, periodStart)
        const existingInvoice = await prisma.invoice.findUnique({
          where: {
            subscriptionId_periodStart: {
              subscriptionId: sub.id,
              periodStart: currentPeriodStart,
            },
          },
        });

        if (existingInvoice) {
          // Already generated (idempotency check)
          currentPeriodStart = advanceBillingDate(currentPeriodStart, sub.plan.billingPeriod);
          continue;
        }

        // Format order items for discount evaluation
        const orderItems = sub.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice.toNumber(),
          amount: l.amount.toNumber(),
        }));

        // Select single best discount
        const { discount: bestDiscount, saving: discountAmount } = selectBestDiscount(
          availableDiscounts,
          orderItems,
          currentPeriodStart
        );

        // Distribute discount proportionally across lines
        const subtotal = orderItems.reduce((acc, it) => acc + it.amount, 0);
        const lineDiscountRatio = subtotal > 0 ? discountAmount / subtotal : 0;

        const lineInputs = sub.lines.map((l, index) => {
          const lineBase = l.amount.toNumber();
          const lineDiscount = Math.round(lineBase * lineDiscountRatio * 100) / 100;
          return {
            quantity: l.quantity,
            unitPrice: l.unitPrice.toNumber(),
            discount: lineDiscount,
            taxRate: l.taxRate.toNumber(),
            description: l.variant
              ? `${l.product.name} (${l.variant.attribute}: ${l.variant.value})`
              : l.product.name,
            sortOrder: index,
          };
        });

        const totals = computeInvoiceTotals(lineInputs);
        const invoiceNumber = await getNextSequenceNumber("INV", "invoice");

        // Execute generation and date advancement inside isolated transaction
        await prisma.$transaction(async (tx) => {
          // 1. Create Invoice
          await tx.invoice.create({
            data: {
              number: invoiceNumber,
              customerId: sub.customerId,
              subscriptionId: sub.id,
              periodStart: currentPeriodStart,
              periodEnd,
              dueDate,
              status: "DRAFT",
              subtotal: totals.subtotal,
              discountTotal: totals.discountTotal,
              taxTotal: totals.taxTotal,
              grandTotal: totals.grandTotal,
              discountId: bestDiscount?.id || null,
              lines: {
                create: lineInputs.map((li) => {
                  const taxable = Math.max(0, li.quantity * li.unitPrice - li.discount);
                  const taxAmount = Math.round(taxable * (li.taxRate / 100) * 100) / 100;
                  return {
                    description: li.description,
                    quantity: li.quantity,
                    unitPrice: li.unitPrice,
                    discount: li.discount,
                    taxRate: li.taxRate,
                    taxAmount,
                    amount: taxable + taxAmount,
                    sortOrder: li.sortOrder,
                  };
                }),
              },
            },
          });

          // 2. Increment discount usage count if applied
          if (bestDiscount) {
            await tx.discount.update({
              where: { id: bestDiscount.id },
              data: { usageCount: { increment: 1 } },
            });
            // Update in-memory rule usageCount so subsequent iterations observe limit
            bestDiscount.usageCount++;
          }

          // 3. Advance subscription nextInvoiceDate
          const nextDate = advanceBillingDate(currentPeriodStart, sub.plan.billingPeriod);
          await tx.subscription.update({
            where: { id: sub.id },
            data: { nextInvoiceDate: nextDate },
          });

          currentPeriodStart = nextDate;
        });

        result.created++;
        result.details.push({
          subscriptionNumber: sub.number,
          invoiceNumber,
          status: "CREATED",
        });
      }
    } catch (err: any) {
      console.error(`[Billing Engine Failure for ${sub.number}]`, err);
      result.failed++;
      result.details.push({
        subscriptionNumber: sub.number,
        status: "FAILED",
        error: err.message || "Unknown billing error",
      });
    }
  }

  return result;
}

