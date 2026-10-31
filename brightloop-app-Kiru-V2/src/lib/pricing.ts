import { addPaise, capAtPaise, fromPaise, mulPaiseByInt, percentOfPaise, toPaise } from "@/lib/money";

export type DiscountInput = {
  type: "FIXED" | "PERCENTAGE";
  value: string;
  scope: "SUBSCRIPTION" | "PRODUCT";
  productId: number | null;
  minPurchase: string | null;
  minQuantity: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export type PricingPreviewInput = {
  basePrice: string;
  variantExtraPrice?: string;
  quantity: number;
  productId: number;
  discount?: DiscountInput | null;
  taxRatePct?: string | null;
  now?: Date;
};

export type PricingPreviewResult = {
  basePrice: string;
  variantExtra: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
  discountApplied: boolean;
  discountRejectReason: string | null;
  discountAmount: string;
  taxableAmount: string;
  taxRatePct: string;
  taxAmount: string;
  total: string;
};

function isWithinValidity(now: Date, startDate: string | null, endDate: string | null): boolean {
  const today = now.toISOString().slice(0, 10);
  if (startDate && today < startDate) return false;
  if (endDate && today > endDate) return false;
  return true;
}

export function evaluateDiscount(
  discount: DiscountInput,
  context: { productId: number; subtotalPaise: bigint; quantity: number; now: Date }
): { eligible: boolean; reason: string | null } {
  if (!discount.active) return { eligible: false, reason: "Discount is inactive" };
  if (!isWithinValidity(context.now, discount.startDate, discount.endDate)) {
    return { eligible: false, reason: "Discount is outside its validity period" };
  }
  if (discount.scope === "PRODUCT" && discount.productId !== null && discount.productId !== context.productId) {
    return { eligible: false, reason: "Discount does not apply to this product" };
  }
  if (discount.minPurchase && context.subtotalPaise < toPaise(discount.minPurchase)) {
    return { eligible: false, reason: "Subtotal is below the discount's minimum purchase amount" };
  }
  if (discount.minQuantity && context.quantity < discount.minQuantity) {
    return { eligible: false, reason: "Quantity is below the discount's minimum quantity" };
  }
  if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
    return { eligible: false, reason: "Discount usage limit has been reached" };
  }
  return { eligible: true, reason: null };
}

export function calculatePricingPreview(input: PricingPreviewInput): PricingPreviewResult {
  const now = input.now ?? new Date();
  const basePaise = toPaise(input.basePrice);
  const variantPaise = toPaise(input.variantExtraPrice ?? "0");
  const unitPaise = addPaise(basePaise, variantPaise);
  const subtotalPaise = mulPaiseByInt(unitPaise, input.quantity);

  let discountAmountPaise = 0n;
  let discountApplied = false;
  let discountRejectReason: string | null = null;

  if (input.discount) {
    const { eligible, reason } = evaluateDiscount(input.discount, {
      productId: input.productId,
      subtotalPaise,
      quantity: input.quantity,
      now,
    });
    if (eligible) {
      discountApplied = true;
      const raw =
        input.discount.type === "PERCENTAGE"
          ? percentOfPaise(subtotalPaise, input.discount.value)
          : toPaise(input.discount.value);
      discountAmountPaise = capAtPaise(raw, subtotalPaise);
    } else {
      discountRejectReason = reason;
    }
  }

  const taxableAmountPaise = subtotalPaise - discountAmountPaise;
  const taxRatePct = input.taxRatePct ?? "0";
  const taxAmountPaise = percentOfPaise(taxableAmountPaise, taxRatePct);
  const totalPaise = taxableAmountPaise + taxAmountPaise;

  return {
    basePrice: fromPaise(basePaise),
    variantExtra: fromPaise(variantPaise),
    unitPrice: fromPaise(unitPaise),
    quantity: input.quantity,
    subtotal: fromPaise(subtotalPaise),
    discountApplied,
    discountRejectReason,
    discountAmount: fromPaise(discountAmountPaise),
    taxableAmount: fromPaise(taxableAmountPaise),
    taxRatePct,
    taxAmount: fromPaise(taxAmountPaise),
    total: fromPaise(totalPaise),
  };
}
