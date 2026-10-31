import { describe, it, expect } from "vitest";
import {
  createDiscountSchema,
  createPlanSchema,
  createProductSchema,
  createTaxRuleSchema,
  createVariantSchema,
  moneyString,
} from "@/lib/validation";

describe("moneyString", () => {
  it("accepts non-negative amounts with up to 2 decimals", () => {
    expect(moneyString.safeParse("1499.00").success).toBe(true);
    expect(moneyString.safeParse("0").success).toBe(true);
    expect(moneyString.safeParse("10.5").success).toBe(true);
  });

  it("rejects negative amounts and malformed strings", () => {
    expect(moneyString.safeParse("-10.00").success).toBe(false);
    expect(moneyString.safeParse("abc").success).toBe(false);
    expect(moneyString.safeParse("10.999").success).toBe(false);
  });
});

describe("createProductSchema", () => {
  const base = {
    name: "BrightMail",
    category: "Email Marketing",
    type: "SOFTWARE",
    salesPrice: "799.00",
  };

  it("accepts a valid product", () => {
    expect(createProductSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an empty category (existence/active-status is checked server-side against product_categories, not via this schema)", () => {
    const result = createProductSchema.safeParse({ ...base, category: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative sales price", () => {
    const result = createProductSchema.safeParse({ ...base, salesPrice: "-5.00" });
    expect(result.success).toBe(false);
  });

  it("defaults cost price and currency when omitted", () => {
    const result = createProductSchema.safeParse(base);
    if (result.success) {
      expect(result.data.costPrice).toBe("0");
      expect(result.data.currency).toBe("INR");
    }
  });
});

describe("createVariantSchema", () => {
  it("accepts a valid variant", () => {
    expect(createVariantSchema.safeParse({ name: "1 TB", code: "1TB", extraPrice: "560.00" }).success).toBe(true);
  });

  it("rejects a negative extra price", () => {
    expect(createVariantSchema.safeParse({ name: "1 TB", extraPrice: "-1" }).success).toBe(false);
  });
});

describe("createPlanSchema", () => {
  const base = { productId: 1, name: "Monthly", price: "799.00", billingPeriod: "MONTHLY" as const };

  it("accepts a valid plan", () => {
    expect(createPlanSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid billing frequency", () => {
    expect(createPlanSchema.safeParse({ ...base, billingPeriod: "FORTNIGHTLY" }).success).toBe(false);
  });

  it("rejects a non-positive minimum quantity", () => {
    expect(createPlanSchema.safeParse({ ...base, minQuantity: 0 }).success).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    const result = createPlanSchema.safeParse({ ...base, availableFrom: "2026-06-01", availableTo: "2026-01-01" });
    expect(result.success).toBe(false);
  });

  it("accepts an end date on or after the start date", () => {
    const result = createPlanSchema.safeParse({ ...base, availableFrom: "2026-01-01", availableTo: "2026-06-01" });
    expect(result.success).toBe(true);
  });
});

describe("createTaxRuleSchema", () => {
  it("accepts a valid tax rule", () => {
    expect(createTaxRuleSchema.safeParse({ name: "GST 18%", rate: "18.00" }).success).toBe(true);
  });

  it("rejects a negative rate", () => {
    expect(createTaxRuleSchema.safeParse({ name: "Bad", rate: "-5" }).success).toBe(false);
  });

  it("rejects a rate above 100%", () => {
    expect(createTaxRuleSchema.safeParse({ name: "Bad", rate: "150" }).success).toBe(false);
  });

  it("rejects an effective end date before the start date", () => {
    const result = createTaxRuleSchema.safeParse({ name: "GST", rate: "18", effectiveFrom: "2026-06-01", effectiveTo: "2026-01-01" });
    expect(result.success).toBe(false);
  });
});

describe("createDiscountSchema", () => {
  const base = { name: "Launch Offer", type: "PERCENTAGE" as const, value: "10", scope: "SUBSCRIPTION" as const };

  it("accepts a valid subscription-scoped discount", () => {
    expect(createDiscountSchema.safeParse(base).success).toBe(true);
  });

  it("requires a productId when scope is PRODUCT", () => {
    const result = createDiscountSchema.safeParse({ ...base, scope: "PRODUCT" });
    expect(result.success).toBe(false);
  });

  it("accepts a product-scoped discount with a productId", () => {
    const result = createDiscountSchema.safeParse({ ...base, scope: "PRODUCT", productId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects a percentage discount above 100%", () => {
    const result = createDiscountSchema.safeParse({ ...base, value: "150" });
    expect(result.success).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    const result = createDiscountSchema.safeParse({ ...base, startDate: "2026-06-01", endDate: "2026-01-01" });
    expect(result.success).toBe(false);
  });
});
