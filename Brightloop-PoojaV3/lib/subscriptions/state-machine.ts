import { SubscriptionStatus } from "@prisma/client";
import { validatePlanAction } from "@/lib/catalog";

export interface StateMachineContext {
  fromStatus: SubscriptionStatus;
  toStatus: SubscriptionStatus;
  plan: {
    pausable: boolean;
    closable: boolean;
    renewable: boolean;
    autoClose: boolean;
  };
  quotationCreatedAt?: Date | null;
  validityDays?: number | null;
}

/**
 * Pure function: Validate subscription state transition.
 * Returns { valid: true } or { valid: false, reason: string }.
 */
export function validateSubscriptionTransition(
  ctx: StateMachineContext
): { valid: boolean; reason?: string } {
  const { fromStatus, toStatus, plan, quotationCreatedAt, validityDays } = ctx;

  // Closed is final
  if (fromStatus === "CLOSED") {
    return { valid: false, reason: "Cannot transition from CLOSED state. Closed is final." };
  }

  // Idempotent same state
  if (fromStatus === toStatus) {
    return { valid: true };
  }

  // 1. DRAFT transitions
  if (fromStatus === "DRAFT") {
    if (toStatus === "QUOTATION" || toStatus === "CONFIRMED") {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Invalid transition from DRAFT to ${toStatus}. Must go to QUOTATION or CONFIRMED.`,
    };
  }

  // 2. QUOTATION transitions
  if (fromStatus === "QUOTATION") {
    if (toStatus === "CONFIRMED") {
      // Check expiration if validityDays provided
      if (quotationCreatedAt && validityDays) {
        const expiryTime = new Date(quotationCreatedAt).getTime() + validityDays * 24 * 60 * 60 * 1000;
        if (Date.now() > expiryTime) {
          return {
            valid: false,
            reason: "Quotation has expired and cannot be confirmed. Please issue a new quotation.",
          };
        }
      }
      return { valid: true };
    }
    if (toStatus === "CLOSED") {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Invalid transition from QUOTATION to ${toStatus}.`,
    };
  }

  // 3. CONFIRMED transitions
  if (fromStatus === "CONFIRMED") {
    if (toStatus === "ACTIVE") {
      return { valid: true };
    }
    if (toStatus === "CLOSED") {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Invalid transition from CONFIRMED to ${toStatus}. Must go to ACTIVE.`,
    };
  }

  // 4. ACTIVE transitions
  if (fromStatus === "ACTIVE") {
    if (toStatus === "PAUSED") {
      const check = validatePlanAction(plan, "pause");
      if (!check.allowed) return { valid: false, reason: check.reason };
      return { valid: true };
    }
    if (toStatus === "CLOSED") {
      const check = validatePlanAction(plan, "close");
      if (!check.allowed) return { valid: false, reason: check.reason };
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Invalid transition from ACTIVE to ${toStatus}. Can only pause or close.`,
    };
  }

  // 5. PAUSED transitions
  if (fromStatus === "PAUSED") {
    if (toStatus === "ACTIVE") {
      return { valid: true };
    }
    if (toStatus === "CLOSED") {
      const check = validatePlanAction(plan, "close");
      if (!check.allowed) return { valid: false, reason: check.reason };
      return { valid: true };
    }
    return {
      valid: false,
      reason: `Invalid transition from PAUSED to ${toStatus}. Can only resume to ACTIVE or CLOSE.`,
    };
  }

  return { valid: false, reason: `Unknown transition from ${fromStatus} to ${toStatus}.` };
}

