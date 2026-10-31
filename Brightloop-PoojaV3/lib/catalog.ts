import { Decimal } from "@prisma/client/runtime/library";

/**
 * Pure function: Calculate unit price with variants.
 * Unit price = sales price + sum of selected variant extra prices.
 * Example: Base 2000 + Odoo variant extra 560 = 2560.
 */
export function computeUnitPrice(
  salesPrice: number | string | Decimal,
  variantExtras: (number | string | Decimal)[] = []
): number {
  const base = typeof salesPrice === "object" && "toNumber" in salesPrice
    ? salesPrice.toNumber()
    : Number(salesPrice);

  const extrasSum = variantExtras.reduce<number>((acc, curr) => {
    const val = typeof curr === "object" && "toNumber" in curr
      ? curr.toNumber()
      : Number(curr);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return Math.round((base + extrasSum) * 100) / 100;
}

/**
 * Pure function: Validate subscription plan flags.
 * - pause requires plan.pausable
 * - early close requires plan.closable
 * - renew requires plan.renewable
 */
export function validatePlanAction(
  plan: {
    pausable: boolean;
    closable: boolean;
    renewable: boolean;
    autoClose: boolean;
  },
  action: "pause" | "close" | "renew"
): { allowed: boolean; reason?: string } {
  if (action === "pause" && !plan.pausable) {
    return {
      allowed: false,
      reason: "This plan does not permit pausing subscriptions.",
    };
  }

  if (action === "close" && !plan.closable) {
    return {
      allowed: false,
      reason: "This plan does not permit early cancellation.",
    };
  }

  if (action === "renew" && !plan.renewable) {
    return {
      allowed: false,
      reason: "This plan does not permit manual renewals.",
    };
  }

  return { allowed: true };
}

/**
 * Pure function: Check if plan is available on a given date.
 */
export function isPlanAvailable(
  plan: {
    availableFrom?: Date | string | null;
    availableTo?: Date | string | null;
    minQuantity: number;
    isArchived: boolean;
  },
  requestedQuantity: number,
  targetDate: Date = new Date()
): { valid: boolean; reason?: string } {
  if (plan.isArchived) {
    return { valid: false, reason: "This plan is archived and no longer available." };
  }

  if (requestedQuantity < plan.minQuantity) {
    return {
      valid: false,
      reason: `Quantity must be at least the plan minimum of ${plan.minQuantity}.`,
    };
  }

  const checkTime = targetDate.getTime();

  if (plan.availableFrom && checkTime < new Date(plan.availableFrom).getTime()) {
    return { valid: false, reason: "This plan is not yet available." };
  }

  if (plan.availableTo && checkTime > new Date(plan.availableTo).getTime()) {
    return { valid: false, reason: "This plan's availability period has ended." };
  }

  return { valid: true };
}

