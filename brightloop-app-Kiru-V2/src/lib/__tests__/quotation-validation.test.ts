import { describe, it, expect } from "vitest";
import {
  createQuotationSchema,
  createSubscriptionSchema,
  createTemplateSchema,
  lineItemInputSchema,
  renewSubscriptionSchema,
} from "@/lib/validation";

describe("lineItemInputSchema", () => {
  it("accepts a minimal valid line", () => {
    expect(lineItemInputSchema.safeParse({ productId: 1, planId: 1 }).success).toBe(true);
  });

  it("rejects a missing planId", () => {
    expect(lineItemInputSchema.safeParse({ productId: 1 }).success).toBe(false);
  });

  it("defaults quantity to 1", () => {
    const result = lineItemInputSchema.safeParse({ productId: 1, planId: 1 });
    if (result.success) expect(result.data.quantity).toBe(1);
  });
});

describe("createTemplateSchema", () => {
  it("requires at least one line", () => {
    const result = createTemplateSchema.safeParse({ name: "Starter Bundle", lines: [] });
    expect(result.success).toBe(false);
  });

  it("accepts a valid multi-line template", () => {
    const result = createTemplateSchema.safeParse({
      name: "Starter Bundle",
      lines: [
        { productId: 1, planId: 1, quantity: 1 },
        { productId: 2, planId: 2, quantity: 2 },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("createQuotationSchema", () => {
  const base = { customerId: 1, currency: "INR", lines: [{ productId: 1, planId: 1 }] };

  it("accepts a valid quotation", () => {
    expect(createQuotationSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a quotation with no lines", () => {
    expect(createQuotationSchema.safeParse({ ...base, lines: [] }).success).toBe(false);
  });
});

describe("createSubscriptionSchema", () => {
  it("requires a start date", () => {
    const result = createSubscriptionSchema.safeParse({ customerId: 1, lines: [{ productId: 1, planId: 1 }] });
    expect(result.success).toBe(false);
  });

  it("accepts a valid direct-creation payload", () => {
    const result = createSubscriptionSchema.safeParse({ customerId: 1, startDate: "2026-01-01", lines: [{ productId: 1, planId: 1 }] });
    expect(result.success).toBe(true);
  });
});

describe("renewSubscriptionSchema", () => {
  it("allows an empty body (carry-forward renewal with no overrides)", () => {
    expect(renewSubscriptionSchema.safeParse({}).success).toBe(true);
  });

  it("accepts optional overrides", () => {
    const result = renewSubscriptionSchema.safeParse({ startDate: "2026-07-01", lines: [{ productId: 1, planId: 1, quantity: 3 }] });
    expect(result.success).toBe(true);
  });
});
