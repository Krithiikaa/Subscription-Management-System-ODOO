import { describe, it, expect } from "vitest";
import { validatePayment } from "@/lib/payments/engine";

describe("Phase 6: Payment Rules & Balance Calculation", () => {
  it("rejects payments on DRAFT invoices", () => {
    const res = validatePayment({ status: "DRAFT", grandTotal: 2560 }, [], 1000);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("only be recorded against CONFIRMED");
  });

  it("rejects payments on CANCELLED invoices", () => {
    const res = validatePayment({ status: "CANCELLED", grandTotal: 2560 }, [], 1000);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("CANCELLED invoice");
  });

  it("rejects overpayment beyond current balance", () => {
    // Grand total 2560, existing payment 2000 -> balance is 560
    const res = validatePayment(
      { status: "CONFIRMED", grandTotal: 2560 },
      [{ amount: 2000, isReversal: false }],
      600 // 600 > 560
    );
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Overpayment rejected");
  });

  it("supports partial payments and accurately tracks remaining balance", () => {
    const res = validatePayment(
      { status: "CONFIRMED", grandTotal: 2560 },
      [],
      1500
    );
    expect(res.valid).toBe(true);
    expect(res.balanceAfter).toBe(1060);
    expect(res.willBePaid).toBe(false);
  });

  it("flips invoice to Paid exactly at full payment", () => {
    const res = validatePayment(
      { status: "CONFIRMED", grandTotal: 2560 },
      [{ amount: 1500, isReversal: false }],
      1060 // 1500 + 1060 = 2560
    );
    expect(res.valid).toBe(true);
    expect(res.balanceAfter).toBe(0);
    expect(res.willBePaid).toBe(true);
  });
});

