import { describe, it, expect } from "vitest";
import { calculatePricingPreview, evaluateDiscount, type DiscountInput } from "@/lib/pricing";

const baseDiscount: DiscountInput = {
  type: "PERCENTAGE",
  value: "10",
  scope: "PRODUCT",
  productId: 1,
  minPurchase: null,
  minQuantity: null,
  startDate: null,
  endDate: null,
  usageLimit: null,
  usedCount: 0,
  active: true,
};

describe("calculatePricingPreview", () => {
  it("matches the spec's worked example: ₹1,499 base + ₹560 variant x 2 = ₹4,118 subtotal", () => {
    const result = calculatePricingPreview({ basePrice: "1499.00", variantExtraPrice: "560.00", quantity: 2, productId: 1 });
    expect(result.basePrice).toBe("1499.00");
    expect(result.variantExtra).toBe("560.00");
    expect(result.unitPrice).toBe("2059.00");
    expect(result.subtotal).toBe("4118.00");
  });

  it("defaults variant extra to zero when no variant is selected", () => {
    const result = calculatePricingPreview({ basePrice: "799.00", quantity: 1, productId: 1 });
    expect(result.unitPrice).toBe("799.00");
    expect(result.subtotal).toBe("799.00");
  });

  it("applies a percentage tax on the taxable amount", () => {
    const result = calculatePricingPreview({ basePrice: "1000.00", quantity: 1, productId: 1, taxRatePct: "18" });
    expect(result.taxableAmount).toBe("1000.00");
    expect(result.taxAmount).toBe("180.00");
    expect(result.total).toBe("1180.00");
  });

  it("applies an eligible percentage discount before tax", () => {
    const result = calculatePricingPreview({
      basePrice: "1000.00",
      quantity: 1,
      productId: 1,
      discount: baseDiscount,
      taxRatePct: "18",
    });
    expect(result.discountApplied).toBe(true);
    expect(result.discountAmount).toBe("100.00");
    expect(result.taxableAmount).toBe("900.00");
    expect(result.taxAmount).toBe("162.00");
    expect(result.total).toBe("1062.00");
  });

  it("applies a fixed discount, capped at the subtotal, never going negative", () => {
    const result = calculatePricingPreview({
      basePrice: "50.00",
      quantity: 1,
      productId: 1,
      discount: { ...baseDiscount, type: "FIXED", value: "100.00" },
    });
    expect(result.discountAmount).toBe("50.00");
    expect(result.taxableAmount).toBe("0.00");
  });

  it("rejects a discount scoped to a different product", () => {
    const result = calculatePricingPreview({
      basePrice: "1000.00",
      quantity: 1,
      productId: 2,
      discount: baseDiscount, // scoped to productId: 1
    });
    expect(result.discountApplied).toBe(false);
    expect(result.discountRejectReason).toMatch(/does not apply/i);
    expect(result.discountAmount).toBe("0.00");
  });

  it("does not consume usage or error when a discount preview is rejected — it just reports why", () => {
    const result = calculatePricingPreview({
      basePrice: "1000.00",
      quantity: 1,
      productId: 1,
      discount: { ...baseDiscount, active: false },
    });
    expect(result.discountApplied).toBe(false);
    expect(result.discountRejectReason).toBe("Discount is inactive");
    expect(result.total).toBe("1000.00");
  });
});

describe("evaluateDiscount", () => {
  const ctx = { productId: 1, subtotalPaise: 100000n, quantity: 5, now: new Date("2026-06-15") };

  it("rejects an expired discount", () => {
    const { eligible, reason } = evaluateDiscount({ ...baseDiscount, endDate: "2026-01-01" }, ctx);
    expect(eligible).toBe(false);
    expect(reason).toMatch(/validity period/i);
  });

  it("rejects a discount that has not started yet", () => {
    const { eligible, reason } = evaluateDiscount({ ...baseDiscount, startDate: "2027-01-01" }, ctx);
    expect(eligible).toBe(false);
    expect(reason).toMatch(/validity period/i);
  });

  it("rejects when below minimum purchase amount", () => {
    const { eligible, reason } = evaluateDiscount({ ...baseDiscount, minPurchase: "2000.00" }, ctx);
    expect(eligible).toBe(false);
    expect(reason).toMatch(/minimum purchase/i);
  });

  it("rejects when below minimum quantity", () => {
    const { eligible, reason } = evaluateDiscount({ ...baseDiscount, minQuantity: 10 }, ctx);
    expect(eligible).toBe(false);
    expect(reason).toMatch(/minimum quantity/i);
  });

  it("rejects when the usage limit has been reached", () => {
    const { eligible, reason } = evaluateDiscount({ ...baseDiscount, usageLimit: 5, usedCount: 5 }, ctx);
    expect(eligible).toBe(false);
    expect(reason).toMatch(/usage limit/i);
  });

  it("accepts a discount with no scope restriction (SUBSCRIPTION scope)", () => {
    const { eligible } = evaluateDiscount({ ...baseDiscount, scope: "SUBSCRIPTION", productId: null }, { ...ctx, productId: 999 });
    expect(eligible).toBe(true);
  });

  it("accepts a fully eligible product-scoped discount", () => {
    const { eligible, reason } = evaluateDiscount(baseDiscount, ctx);
    expect(eligible).toBe(true);
    expect(reason).toBeNull();
  });
});
