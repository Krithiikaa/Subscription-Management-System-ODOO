import { BillingPeriod } from "@prisma/client";

/**
 * Pure function: Advance date by one billing period, strictly handling month-end clamping.
 * Examples:
 * - 31 Jan + 1 MONTH -> 28 Feb (or 29 Feb in leap year)
 * - 31 Mar + 1 MONTH -> 30 Apr
 * - 31 Aug + 1 MONTH -> 30 Sep
 */
export function advanceBillingDate(
  currentDate: Date | string,
  period: BillingPeriod
): Date {
  const d = new Date(currentDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  switch (period) {
    case "DAILY": {
      const next = new Date(d);
      next.setDate(day + 1);
      return next;
    }

    case "WEEKLY": {
      const next = new Date(d);
      next.setDate(day + 7);
      return next;
    }

    case "MONTHLY": {
      // Advance by one calendar month with clamping to last day of next month
      const targetMonth = month + 1;
      const targetYear = year + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12;

      // Find max days in target month (day 0 of subsequent month gives last day of target month)
      const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      const clampedDay = Math.min(day, daysInTargetMonth);

      // Important: set date to 1 first to prevent JS month overflow when day is 31
      const next = new Date(d);
      next.setDate(1);
      next.setFullYear(targetYear);
      next.setMonth(normalizedMonth);
      next.setDate(clampedDay);
      return next;
    }

    case "YEARLY": {
      const targetYear = year + 1;
      // Handle Feb 29 leap year clamping to Feb 28
      const daysInTargetMonth = new Date(targetYear, month + 1, 0).getDate();
      const clampedDay = Math.min(day, daysInTargetMonth);

      const next = new Date(d);
      next.setDate(1);
      next.setFullYear(targetYear);
      next.setMonth(month);
      next.setDate(clampedDay);
      return next;
    }

    default:
      return new Date(d);
  }
}

/**
 * Pure function: Calculate periodEnd from periodStart.
 * Period end is the last moment of the billing cycle (periodStart + period - 1 day).
 */
export function calculatePeriodEnd(
  periodStart: Date | string,
  period: BillingPeriod
): Date {
  const nextStart = advanceBillingDate(periodStart, period);
  // Period end is 1 second before next period start
  return new Date(nextStart.getTime() - 1000);
}

/**
 * Pure function: Calculate due date from periodStart and payment terms (days).
 */
export function calculateDueDate(
  periodStart: Date | string,
  paymentTermsDays: number = 30
): Date {
  const d = new Date(periodStart);
  d.setDate(d.getDate() + paymentTermsDays);
  return d;
}
