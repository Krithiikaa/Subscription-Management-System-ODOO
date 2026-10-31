import { describe, it, expect } from "vitest";
import { validateSubscriptionTransition } from "@/lib/subscriptions/state-machine";

describe("Phase 3: Subscription State Machine & Transition Rules", () => {
  const standardPlan = {
    pausable: true,
    closable: true,
    renewable: true,
    autoClose: false,
  };

  it("permits standard valid progression: Draft -> Quotation -> Confirmed -> Active -> Closed", () => {
    expect(
      validateSubscriptionTransition({
        fromStatus: "DRAFT",
        toStatus: "QUOTATION",
        plan: standardPlan,
      }).valid
    ).toBe(true);

    expect(
      validateSubscriptionTransition({
        fromStatus: "QUOTATION",
        toStatus: "CONFIRMED",
        plan: standardPlan,
      }).valid
    ).toBe(true);

    expect(
      validateSubscriptionTransition({
        fromStatus: "CONFIRMED",
        toStatus: "ACTIVE",
        plan: standardPlan,
      }).valid
    ).toBe(true);

    expect(
      validateSubscriptionTransition({
        fromStatus: "ACTIVE",
        toStatus: "CLOSED",
        plan: standardPlan,
      }).valid
    ).toBe(true);
  });

  it("rejects illegal transitions: Draft -> Active, Draft -> Closed", () => {
    const res = validateSubscriptionTransition({
      fromStatus: "DRAFT",
      toStatus: "ACTIVE",
      plan: standardPlan,
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Invalid transition");
  });

  it("blocks any transition from CLOSED (Closed is final)", () => {
    const res = validateSubscriptionTransition({
      fromStatus: "CLOSED",
      toStatus: "ACTIVE",
      plan: standardPlan,
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Closed is final");
  });

  it("blocks pausing if plan.pausable is false", () => {
    const nonPausablePlan = {
      pausable: false,
      closable: true,
      renewable: false,
      autoClose: true,
    };

    const res = validateSubscriptionTransition({
      fromStatus: "ACTIVE",
      toStatus: "PAUSED",
      plan: nonPausablePlan,
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("does not permit pausing");
  });

  it("blocks confirmation of an expired quotation", () => {
    // Quotation created 20 days ago with 15 days validity
    const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const res = validateSubscriptionTransition({
      fromStatus: "QUOTATION",
      toStatus: "CONFIRMED",
      plan: standardPlan,
      quotationCreatedAt: oldDate,
      validityDays: 15,
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("expired");
  });
});

