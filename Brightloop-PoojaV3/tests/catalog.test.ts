import { describe, it, expect } from "vitest";
import { computeUnitPrice, validatePlanAction, isPlanAvailable } from "@/lib/catalog";
import { selectBestDiscount, DiscountRule } from "@/lib/billing/discounts";
import { computeLineTax, computeInvoiceTotals } from "@/lib/billing/taxes";

describe("Phase 2: Catalog, Pricing, Taxes & Discounts", () => {
  it("calculates unit price with variants (Odoo Brand test: 2000 + 560 = 2560)", () => {
    const basePrice = 2000;
    const odooVariantExtra = 560;
    const unitPrice = computeUnitPrice(basePrice, [odooVariantExtra]);
    expect(unitPrice).toBe(2560);
  });

  it("calculates unit price with multiple variants or zero extras", () => {
    expect(computeUnitPrice(1000, [0])).toBe(1000);
    expect(computeUnitPrice(5000, [560, 300, 140])).toBe(6000);
  });

  it("strictly enforces plan behaviour flags (pausable, closable, renewable)", () => {
    const trialPlan = {
      autoClose: true,
      closable: true,
      pausable: false,
      renewable: false,
    };

    expect(validatePlanAction(trialPlan, "pause").allowed).toBe(false);
    expect(validatePlanAction(trialPlan, "renew").allowed).toBe(false);
    expect(validatePlanAction(trialPlan, "close").allowed).toBe(true);

    const annualPlan = {
      autoClose: false,
      closable: false,
      pausable: true,
      renewable: true,
    };

    expect(validatePlanAction(annualPlan, "pause").allowed).toBe(true);
    expect(validatePlanAction(annualPlan, "close").allowed).toBe(false);
    expect(validatePlanAction(annualPlan, "renew").allowed).toBe(true);
  });

  it("selects the single best discount that yields the highest saving", () => {
    const discounts: DiscountRule[] = [
      {
        id: "d1",
        name: "Flat ₹500 off",
        type: "FIXED",
        value: 500,
        usageCount: 0,
        appliesToAll: true,
        isActive: true,
      },
      {
        id: "d2",
        name: "15% off",
        type: "PERCENTAGE",
        value: 15,
        usageCount: 0,
        appliesToAll: true,
        isActive: true,
      },
    ];

    // For ₹10,000 purchase: 15% gives ₹1,500 saving > ₹500 fixed
    const items = [{ productId: "p1", quantity: 5, unitPrice: 2000, amount: 10000 }];
    const result = selectBestDiscount(discounts, items);
    expect(result.discount?.id).toBe("d2");
    expect(result.saving).toBe(1500);
  });

  it("stops applying discount once usage limit is reached", () => {
    const limitedDiscount: DiscountRule = {
      id: "d_limit",
      name: "First Order ₹500 off",
      type: "FIXED",
      value: 500,
      usageLimit: 1,
      usageCount: 1, // Already used once!
      appliesToAll: true,
      isActive: true,
    };

    const items = [{ productId: "p1", quantity: 1, unitPrice: 2560, amount: 2560 }];
    const result = selectBestDiscount([limitedDiscount], items);
    expect(result.discount).toBeNull();
    expect(result.saving).toBe(0);
  });

  it("computes tax per line AFTER discount, rounded to 2 decimals", () => {
    // ₹2000 base, ₹500 discount = ₹1500 taxable. 18% GST = ₹270.00
    const taxRes = computeLineTax(2000, 500, 18);
    expect(taxRes.taxableAmount).toBe(1500);
    expect(taxRes.taxAmount).toBe(270);
    expect(taxRes.totalWithTax).toBe(1770);
  });

  it("computes overall invoice totals accurately", () => {
    const lines = [
      { quantity: 2, unitPrice: 2000, discount: 200, taxRate: 18 }, // base 4000, disc 200, tax 18% of 3800 = 684
      { quantity: 1, unitPrice: 1000, discount: 0, taxRate: 5 },    // base 1000, disc 0, tax 5% of 1000 = 50
    ];

    const totals = computeInvoiceTotals(lines);
    expect(totals.subtotal).toBe(5000);
    expect(totals.discountTotal).toBe(200);
    expect(totals.taxTotal).toBe(734);
    expect(totals.grandTotal).toBe(5534);
  });
});

