import { describe, it, expect } from "vitest";
import { findConflictingTaxRule, rangesOverlap, type TaxRuleScopeInput } from "@/lib/tax-overlap";

const gst: TaxRuleScopeInput = {
  id: 1,
  name: "GST 18%",
  productId: 4,
  category: null,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-06-30",
  active: true,
};

describe("rangesOverlap", () => {
  it("detects overlapping date ranges", () => {
    expect(rangesOverlap("2026-01-01", "2026-06-30", "2026-03-01", "2026-09-01")).toBe(true);
  });

  it("treats adjacent non-overlapping ranges as non-overlapping", () => {
    expect(rangesOverlap("2026-01-01", "2026-06-30", "2026-07-01", "2026-12-31")).toBe(false);
  });

  it("handles an open-ended start (null = -infinity)", () => {
    expect(rangesOverlap(null, "2026-06-30", "2026-06-01", "2026-12-31")).toBe(true);
    expect(rangesOverlap(null, "2026-01-01", "2026-06-01", "2026-12-31")).toBe(false);
  });

  it("handles an open-ended end (null = +infinity)", () => {
    expect(rangesOverlap("2026-01-01", null, "2025-01-01", "2025-12-31")).toBe(false);
    expect(rangesOverlap("2026-01-01", null, "2026-06-01", "2026-12-31")).toBe(true);
  });

  it("treats two fully open-ended ranges as overlapping", () => {
    expect(rangesOverlap(null, null, null, null)).toBe(true);
  });
});

describe("findConflictingTaxRule", () => {
  it("flags an overlapping active rule with the same name and scope", () => {
    const candidate: TaxRuleScopeInput = { name: "GST 18%", productId: 4, category: null, effectiveFrom: "2026-03-01", effectiveTo: "2026-09-01", active: true };
    expect(findConflictingTaxRule(candidate, [gst])).toEqual(gst);
  });

  it("allows adjacent, non-overlapping periods for the same name and scope", () => {
    const candidate: TaxRuleScopeInput = { name: "GST 18%", productId: 4, category: null, effectiveFrom: "2026-07-01", effectiveTo: "2026-12-31", active: true };
    expect(findConflictingTaxRule(candidate, [gst])).toBeNull();
  });

  it("allows an open-ended new rule that starts after the existing one ends", () => {
    const candidate: TaxRuleScopeInput = { name: "GST 18%", productId: 4, category: null, effectiveFrom: "2026-07-01", effectiveTo: null, active: true };
    expect(findConflictingTaxRule(candidate, [gst])).toBeNull();
  });

  it("does not conflict across different product scopes", () => {
    const candidate: TaxRuleScopeInput = { name: "GST 18%", productId: 5, category: null, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-30", active: true };
    expect(findConflictingTaxRule(candidate, [gst])).toBeNull();
  });

  it("does not conflict across different category scopes", () => {
    const categoryRule: TaxRuleScopeInput = { id: 2, name: "Cess", productId: null, category: "Cloud Storage", effectiveFrom: null, effectiveTo: null, active: true };
    const candidate: TaxRuleScopeInput = { name: "Cess", productId: null, category: "AI Tools", effectiveFrom: null, effectiveTo: null, active: true };
    expect(findConflictingTaxRule(candidate, [categoryRule])).toBeNull();
  });

  it("allows multiple legitimate tax components for the same scope and period", () => {
    const cgst: TaxRuleScopeInput = { id: 3, name: "CGST 9%", productId: 4, category: null, effectiveFrom: "2026-01-01", effectiveTo: null, active: true };
    const sgst: TaxRuleScopeInput = { name: "SGST 9%", productId: 4, category: null, effectiveFrom: "2026-01-01", effectiveTo: null, active: true };
    expect(findConflictingTaxRule(sgst, [cgst])).toBeNull();
  });

  it("ignores inactive rules when checking for conflicts", () => {
    const inactive: TaxRuleScopeInput = { ...gst, active: false };
    const candidate: TaxRuleScopeInput = { name: "GST 18%", productId: 4, category: null, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-30", active: true };
    expect(findConflictingTaxRule(candidate, [inactive])).toBeNull();
  });

  it("never flags a candidate being saved as inactive", () => {
    const candidate: TaxRuleScopeInput = { name: "GST 18%", productId: 4, category: null, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-30", active: false };
    expect(findConflictingTaxRule(candidate, [gst])).toBeNull();
  });

  it("excludes the rule's own id when checking on update", () => {
    const candidate: TaxRuleScopeInput = { id: 1, name: "GST 18%", productId: 4, category: null, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-30", active: true };
    expect(findConflictingTaxRule(candidate, [gst])).toBeNull();
  });
});
