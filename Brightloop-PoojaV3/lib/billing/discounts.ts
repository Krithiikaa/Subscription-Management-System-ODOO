export interface DiscountRule {
  id: string;
  name: string;
  type: "FIXED" | "PERCENTAGE";
  value: number;
  minAmount?: number | null;
  minQuantity?: number | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  usageLimit?: number | null;
  usageCount: number;
  appliesToAll: boolean;
  isActive: boolean;
  productIds?: string[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

/**
 * Pure function: Select the best qualifying discount for an invoice / subscription.
 * Returns the single discount that generates the maximum monetary saving.
 */
export function selectBestDiscount(
  discounts: DiscountRule[],
  items: OrderItem[],
  evalDate: Date = new Date()
): {
  discount: DiscountRule | null;
  saving: number;
} {
  const totalAmount = items.reduce((acc, it) => acc + it.amount, 0);
  const totalQuantity = items.reduce((acc, it) => acc + it.quantity, 0);
  const evalTime = evalDate.getTime();

  let bestDiscount: DiscountRule | null = null;
  let maxSaving = 0;

  for (const disc of discounts) {
    if (!disc.isActive) continue;

    // Check usage limit
    if (disc.usageLimit !== null && disc.usageLimit !== undefined) {
      if (disc.usageCount >= disc.usageLimit) continue;
    }

    // Check date window
    if (disc.startDate && evalTime < new Date(disc.startDate).getTime()) continue;
    if (disc.endDate && evalTime > new Date(disc.endDate).getTime()) continue;

    // Check minimum purchase amount
    if (disc.minAmount && totalAmount < disc.minAmount) continue;

    // Check minimum purchase quantity
    if (disc.minQuantity && totalQuantity < disc.minQuantity) continue;

    // Calculate eligible amount
    let eligibleAmount = 0;
    if (disc.appliesToAll) {
      eligibleAmount = totalAmount;
    } else if (disc.productIds && disc.productIds.length > 0) {
      eligibleAmount = items
        .filter((it) => disc.productIds!.includes(it.productId))
        .reduce((sum, it) => sum + it.amount, 0);
    }

    if (eligibleAmount <= 0) continue;

    let saving = 0;
    if (disc.type === "FIXED") {
      saving = Math.min(disc.value, eligibleAmount);
    } else if (disc.type === "PERCENTAGE") {
      saving = (eligibleAmount * disc.value) / 100;
      saving = Math.min(saving, eligibleAmount);
    }

    saving = Math.round(saving * 100) / 100;

    if (saving > maxSaving) {
      maxSaving = saving;
      bestDiscount = disc;
    }
  }

  return { discount: bestDiscount, saving: maxSaving };
}

