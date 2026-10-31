// Utility: merge tailwind classes
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format money (NUMERIC stored as string from Postgres)
export function formatMoney(value: string | number | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
}

// Format date (ISO string → DD MMM YYYY)
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Advance nextBillingDate by billing period.
// Uses date-fns so month/year arithmetic clamps to the last valid day of the
// target month (e.g. Jan 31 + MONTHLY -> Feb 28/29) instead of overflowing
// into the next month the way raw Date#setMonth does.
export function advanceBillingDate(
  current: Date,
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
): Date {
  switch (period) {
    case "DAILY":   return addDays(current, 1);
    case "WEEKLY":  return addWeeks(current, 1);
    case "MONTHLY": return addMonths(current, 1);
    case "YEARLY":  return addYears(current, 1);
  }
}

// Generate auto-number (SUB-0001, INV-0001)
export function formatAutoNumber(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

// Status label map
export const STATUS_LABELS: Record<string, string> = {
  DRAFT:     "[DRAFT]",
  QUOTATION: "[QUOTATION]",
  CONFIRMED: "[CONFIRMED]",
  ACTIVE:    "[ACTIVE]",
  PAUSED:    "[PAUSED]",
  CLOSED:    "[CLOSED]",
  PAID:      "[PAID]",
  CANCELLED: "[CANCELLED]",
};

export const STATUS_CLASS: Record<string, string> = {
  DRAFT:     "badge-draft",
  QUOTATION: "badge-warning",
  CONFIRMED: "badge-confirmed",
  ACTIVE:    "badge-active",
  PAUSED:    "badge-paused",
  CLOSED:    "badge-closed",
  PAID:      "badge-paid",
  CANCELLED: "badge-closed",
};
