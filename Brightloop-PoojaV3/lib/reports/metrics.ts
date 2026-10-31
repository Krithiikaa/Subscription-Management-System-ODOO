import { BillingPeriod } from "@prisma/client";

/**
 * Pure function: Calculate Normalized Monthly Recurring Revenue (MRR).
 * Normalization factor per Section 15 Spec:
 * - monthly: x 1
 * - yearly: / 12
 * - weekly: x (52 / 12) = 4.3333
 * - daily: x (365 / 12) = 30.4167
 */
export function normalizeMRR(amount: number, period: BillingPeriod): number {
  switch (period) {
    case "MONTHLY":
      return amount;
    case "YEARLY":
      return amount / 12;
    case "WEEKLY":
      return (amount * 52) / 12;
    case "DAILY":
      return (amount * 365) / 12;
    default:
      return amount;
  }
}

