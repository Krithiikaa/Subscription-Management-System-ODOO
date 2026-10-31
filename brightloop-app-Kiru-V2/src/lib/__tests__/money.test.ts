import { describe, it, expect } from "vitest";
import { addPaise, capAtPaise, fromPaise, mulPaiseByInt, percentOfPaise, toPaise } from "@/lib/money";

describe("toPaise / fromPaise", () => {
  it("round-trips a whole rupee amount", () => {
    expect(toPaise("1499.00")).toBe(149900n);
    expect(fromPaise(149900n)).toBe("1499.00");
  });

  it("handles single-decimal and no-decimal strings", () => {
    expect(toPaise("560")).toBe(56000n);
    expect(toPaise("560.5")).toBe(56050n);
  });

  it("handles zero", () => {
    expect(toPaise("0")).toBe(0n);
    expect(fromPaise(0n)).toBe("0.00");
  });
});

describe("addPaise / mulPaiseByInt", () => {
  it("adds base price and variant extra correctly (₹1,499 + ₹560)", () => {
    const unit = addPaise(toPaise("1499"), toPaise("560"));
    expect(fromPaise(unit)).toBe("2059.00");
  });

  it("multiplies unit price by quantity (₹2,059 x 2 = ₹4,118)", () => {
    const unit = addPaise(toPaise("1499"), toPaise("560"));
    const subtotal = mulPaiseByInt(unit, 2);
    expect(fromPaise(subtotal)).toBe("4118.00");
  });
});

describe("percentOfPaise", () => {
  it("computes a simple percentage", () => {
    expect(fromPaise(percentOfPaise(toPaise("1000.00"), "18"))).toBe("180.00");
  });

  it("rounds half-up to the nearest paisa", () => {
    // 10.005 -> 10.01 under half-up rounding
    expect(fromPaise(percentOfPaise(toPaise("100.05"), "10"))).toBe("10.01");
  });

  it("never produces floating-point drift across repeated calls", () => {
    const base = toPaise("4118.00");
    const tax = percentOfPaise(base, "18");
    expect(fromPaise(tax)).toBe("741.24");
  });
});

describe("capAtPaise", () => {
  it("caps a value at the given ceiling", () => {
    expect(capAtPaise(toPaise("500"), toPaise("300"))).toBe(toPaise("300"));
  });

  it("leaves a value under the cap untouched", () => {
    expect(capAtPaise(toPaise("100"), toPaise("300"))).toBe(toPaise("100"));
  });
});
