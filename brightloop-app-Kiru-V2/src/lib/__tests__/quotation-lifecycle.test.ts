import { describe, it, expect } from "vitest";
import { isValidQuotationTransition, isQuotationExpired } from "@/lib/quotation-lifecycle";

describe("isValidQuotationTransition", () => {
  it("allows DRAFT -> SENT or CANCELLED", () => {
    expect(isValidQuotationTransition("DRAFT", "SENT")).toBe(true);
    expect(isValidQuotationTransition("DRAFT", "CANCELLED")).toBe(true);
  });

  it("allows SENT -> ACCEPTED, REJECTED, EXPIRED or CANCELLED", () => {
    expect(isValidQuotationTransition("SENT", "ACCEPTED")).toBe(true);
    expect(isValidQuotationTransition("SENT", "REJECTED")).toBe(true);
    expect(isValidQuotationTransition("SENT", "EXPIRED")).toBe(true);
    expect(isValidQuotationTransition("SENT", "CANCELLED")).toBe(true);
  });

  it("rejects skipping DRAFT straight to ACCEPTED", () => {
    expect(isValidQuotationTransition("DRAFT", "ACCEPTED")).toBe(false);
  });

  it("treats ACCEPTED, REJECTED, EXPIRED and CANCELLED as terminal", () => {
    for (const terminal of ["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"] as const) {
      expect(isValidQuotationTransition(terminal, "SENT")).toBe(false);
      expect(isValidQuotationTransition(terminal, "DRAFT")).toBe(false);
    }
  });

  it("rejects a double-acceptance transition (ACCEPTED has no outgoing transitions)", () => {
    expect(isValidQuotationTransition("ACCEPTED", "ACCEPTED")).toBe(false);
  });
});

describe("isQuotationExpired", () => {
  it("is not expired when there is no validUntil date", () => {
    expect(isQuotationExpired(null)).toBe(false);
  });

  it("is expired when now is after validUntil", () => {
    expect(isQuotationExpired("2026-01-01", new Date("2026-06-01"))).toBe(true);
  });

  it("is not expired when now is on or before validUntil", () => {
    expect(isQuotationExpired("2026-06-01", new Date("2026-06-01"))).toBe(false);
    expect(isQuotationExpired("2026-12-31", new Date("2026-06-01"))).toBe(false);
  });
});
