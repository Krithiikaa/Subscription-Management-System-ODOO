import { describe, it, expect } from "vitest";
import { computeInvoiceTotals, deriveDueDate, isInvoiceOverdue } from "@/lib/billing-engine";
import { advanceBillingDate } from "@/lib/utils";

describe("computeInvoiceTotals", () => {
  it("sums subtotal, tax, discount and total across multiple lines", () => {
    const totals = computeInvoiceTotals([
      { unitPrice: "100.00", variantExtra: "0", quantity: 2, taxAmount: "36.00", discountAmount: "0", amount: "236.00" },
      { unitPrice: "50.00", variantExtra: "10.00", quantity: 1, taxAmount: "10.80", discountAmount: "5.00", amount: "65.80" },
    ]);
    expect(totals.subtotal).toBe("260.00");
    expect(totals.taxAmount).toBe("46.80");
    expect(totals.discountAmount).toBe("5.00");
    expect(totals.total).toBe("301.80");
  });

  it("returns zeroes for no lines", () => {
    const totals = computeInvoiceTotals([]);
    expect(totals.subtotal).toBe("0.00");
    expect(totals.total).toBe("0.00");
  });
});

describe("deriveDueDate", () => {
  it("adds the default 14 days to the issue date", () => {
    expect(deriveDueDate("2026-01-01")).toBe("2026-01-15");
  });

  it("supports a custom number of days", () => {
    expect(deriveDueDate("2026-01-01", 7)).toBe("2026-01-08");
  });
});

describe("isInvoiceOverdue", () => {
  const now = new Date("2026-02-01T00:00:00Z");

  it("is overdue when due date has passed and outstanding > 0", () => {
    expect(isInvoiceOverdue({ status: "CONFIRMED", dueDate: "2026-01-15", total: "100.00", amountPaid: "0.00" }, now)).toBe(true);
  });

  it("is not overdue when fully paid even if the due date passed", () => {
    expect(isInvoiceOverdue({ status: "PAID", dueDate: "2026-01-15", total: "100.00", amountPaid: "100.00" }, now)).toBe(false);
  });

  it("is not overdue when the due date has not passed yet", () => {
    expect(isInvoiceOverdue({ status: "CONFIRMED", dueDate: "2026-03-01", total: "100.00", amountPaid: "0.00" }, now)).toBe(false);
  });

  it("is not overdue for cancelled or draft invoices", () => {
    expect(isInvoiceOverdue({ status: "CANCELLED", dueDate: "2026-01-01", total: "100.00", amountPaid: "0.00" }, now)).toBe(false);
    expect(isInvoiceOverdue({ status: "DRAFT", dueDate: "2026-01-01", total: "100.00", amountPaid: "0.00" }, now)).toBe(false);
  });

  it("partially-paid invoices with remaining balance past due date are overdue", () => {
    expect(isInvoiceOverdue({ status: "PARTIALLY_PAID", dueDate: "2026-01-15", total: "100.00", amountPaid: "40.00" }, now)).toBe(true);
  });
});

describe("advanceBillingDate — month-end and leap-year safety", () => {
  it("clamps Jan 31 + MONTHLY to Feb 28 in a non-leap year", () => {
    const result = advanceBillingDate(new Date("2025-01-31T00:00:00Z"), "MONTHLY");
    expect(result.toISOString().slice(0, 10)).toBe("2025-02-28");
  });

  it("clamps Jan 31 + MONTHLY to Feb 29 in a leap year", () => {
    const result = advanceBillingDate(new Date("2024-01-31T00:00:00Z"), "MONTHLY");
    expect(result.toISOString().slice(0, 10)).toBe("2024-02-29");
  });

  it("crosses a year boundary correctly for MONTHLY", () => {
    const result = advanceBillingDate(new Date("2025-12-15T00:00:00Z"), "MONTHLY");
    expect(result.toISOString().slice(0, 10)).toBe("2026-01-15");
  });

  it("advances YEARLY across a leap day without drifting", () => {
    const result = advanceBillingDate(new Date("2024-02-29T00:00:00Z"), "YEARLY");
    expect(result.toISOString().slice(0, 10)).toBe("2025-02-28");
  });

  it("advances DAILY and WEEKLY as plain calendar increments", () => {
    expect(advanceBillingDate(new Date("2026-01-30T00:00:00Z"), "DAILY").toISOString().slice(0, 10)).toBe("2026-01-31");
    expect(advanceBillingDate(new Date("2026-01-30T00:00:00Z"), "WEEKLY").toISOString().slice(0, 10)).toBe("2026-02-06");
  });
});
