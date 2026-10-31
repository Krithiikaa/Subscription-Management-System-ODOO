// Utility: merge tailwind classes
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

// Advance nextBillingDate by billing period
export function advanceBillingDate(
  current: Date,
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
): Date {
  const d = new Date(current);
  switch (period) {
    case "DAILY":   d.setDate(d.getDate() + 1); break;
    case "WEEKLY":  d.setDate(d.getDate() + 7); break;
    case "MONTHLY": d.setMonth(d.getMonth() + 1); break;
    case "YEARLY":  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
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
