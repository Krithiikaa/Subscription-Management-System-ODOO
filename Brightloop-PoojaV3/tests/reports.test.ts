import { describe, it, expect } from "vitest";
import { normalizeMRR } from "@/lib/reports/metrics";

describe("Phase 8: Financial Reporting & MRR Normalization", () => {
  it("normalizes monthly billing (x 1)", () => {
    expect(normalizeMRR(5000, "MONTHLY")).toBe(5000);
  });

  it("normalizes yearly billing (/ 12)", () => {
    // ₹24,000 yearly contract = ₹2,000 MRR
    expect(normalizeMRR(24000, "YEARLY")).toBe(2000);
  });

  it("normalizes weekly billing (x 52 / 12)", () => {
    // ₹1,200 weekly = (1200 * 52) / 12 = ₹5,200 MRR
    expect(normalizeMRR(1200, "WEEKLY")).toBe(5200);
  });

  it("normalizes daily billing (x 365 / 12)", () => {
    // ₹120 daily = (120 * 365) / 12 = ₹3,650 MRR
    expect(normalizeMRR(120, "DAILY")).toBe(3650);
  });
});

