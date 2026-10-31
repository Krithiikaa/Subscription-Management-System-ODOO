import { describe, it, expect } from "vitest";
import { isValidTransition, planPermissionsAllow } from "@/lib/subscription-lifecycle";

describe("isValidTransition", () => {
  it("allows the direct-creation fast path DRAFT -> CONFIRMED", () => {
    expect(isValidTransition("DRAFT", "CONFIRMED")).toBe(true);
  });

  it("allows DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE", () => {
    expect(isValidTransition("DRAFT", "QUOTATION")).toBe(true);
    expect(isValidTransition("QUOTATION", "CONFIRMED")).toBe(true);
    expect(isValidTransition("CONFIRMED", "ACTIVE")).toBe(true);
  });

  it("allows ACTIVE <-> PAUSED", () => {
    expect(isValidTransition("ACTIVE", "PAUSED")).toBe(true);
    expect(isValidTransition("PAUSED", "ACTIVE")).toBe(true);
  });

  it("allows closing from any non-terminal state", () => {
    expect(isValidTransition("DRAFT", "CLOSED")).toBe(true);
    expect(isValidTransition("QUOTATION", "CLOSED")).toBe(true);
    expect(isValidTransition("CONFIRMED", "CLOSED")).toBe(true);
    expect(isValidTransition("ACTIVE", "CLOSED")).toBe(true);
    expect(isValidTransition("PAUSED", "CLOSED")).toBe(true);
  });

  it("rejects skipping straight to ACTIVE from DRAFT or QUOTATION", () => {
    expect(isValidTransition("DRAFT", "ACTIVE")).toBe(false);
    expect(isValidTransition("QUOTATION", "ACTIVE")).toBe(false);
  });

  it("rejects any transition out of CLOSED — it is terminal", () => {
    expect(isValidTransition("CLOSED", "ACTIVE")).toBe(false);
    expect(isValidTransition("CLOSED", "DRAFT")).toBe(false);
    expect(isValidTransition("CLOSED", "CONFIRMED")).toBe(false);
  });

  it("rejects a paused subscription being treated as directly resumable to a non-ACTIVE state", () => {
    expect(isValidTransition("PAUSED", "CONFIRMED")).toBe(false);
    expect(isValidTransition("PAUSED", "QUOTATION")).toBe(false);
  });
});

describe("planPermissionsAllow", () => {
  it("allows the operation when every line's plan permits it", () => {
    const plans = [
      { closable: true, pausable: true, renewable: true },
      { closable: true, pausable: true, renewable: false },
    ];
    expect(planPermissionsAllow(plans, "closable")).toBe(true);
    expect(planPermissionsAllow(plans, "pausable")).toBe(true);
  });

  it("rejects the operation when even one line's plan disallows it", () => {
    const plans = [
      { closable: true, pausable: true, renewable: true },
      { closable: false, pausable: true, renewable: true },
    ];
    expect(planPermissionsAllow(plans, "closable")).toBe(false);
  });

  it("rejects when there are no lines at all (nothing to permit)", () => {
    expect(planPermissionsAllow([], "pausable")).toBe(false);
  });
});
