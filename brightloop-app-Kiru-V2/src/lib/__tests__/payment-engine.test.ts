import { describe, it, expect } from "vitest";
import { computeOutstanding, deriveInvoiceStatusAfterPayment, isSessionExpired, validatePaymentAmount } from "@/lib/payment-engine";

describe("computeOutstanding", () => {
  it("computes the remaining balance", () => {
    expect(computeOutstanding("100.00", "40.00")).toBe("60.00");
  });

  it("returns zero when fully paid", () => {
    expect(computeOutstanding("100.00", "100.00")).toBe("0.00");
  });

  it("never goes negative even if overpaid somehow", () => {
    expect(computeOutstanding("100.00", "150.00")).toBe("0.00");
  });
});

describe("deriveInvoiceStatusAfterPayment", () => {
  it("is PARTIALLY_PAID when some balance remains", () => {
    expect(deriveInvoiceStatusAfterPayment("100.00", "40.00")).toBe("PARTIALLY_PAID");
  });

  it("is PAID when the full amount has been paid", () => {
    expect(deriveInvoiceStatusAfterPayment("100.00", "100.00")).toBe("PAID");
  });

  it("reaches PAID after multiple partial payments sum to the total", () => {
    const afterFirst = "40.00";
    expect(deriveInvoiceStatusAfterPayment("100.00", afterFirst)).toBe("PARTIALLY_PAID");
    const afterSecond = "100.00"; // 40 + 60
    expect(deriveInvoiceStatusAfterPayment("100.00", afterSecond)).toBe("PAID");
  });
});

describe("isSessionExpired", () => {
  const now = new Date("2026-01-01T12:00:00Z");

  it("is expired when now is after expiresAt", () => {
    expect(isSessionExpired("2026-01-01T11:59:00Z", now)).toBe(true);
  });

  it("is not expired when now is before expiresAt", () => {
    expect(isSessionExpired("2026-01-01T12:01:00Z", now)).toBe(false);
  });
});

describe("validatePaymentAmount", () => {
  it("rejects zero or negative amounts", () => {
    expect(validatePaymentAmount("0.00", "100.00").valid).toBe(false);
    expect(validatePaymentAmount("-10.00", "100.00").valid).toBe(false);
  });

  it("rejects an amount greater than the outstanding balance", () => {
    expect(validatePaymentAmount("150.00", "100.00").valid).toBe(false);
  });

  it("accepts a valid partial amount", () => {
    expect(validatePaymentAmount("40.00", "100.00").valid).toBe(true);
  });

  it("accepts an amount exactly equal to the outstanding balance", () => {
    expect(validatePaymentAmount("100.00", "100.00").valid).toBe(true);
  });
});
