import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import type { Tx } from "@/db";
import { discounts, plans, productVariants, products, taxRules } from "@/db/schema";
import { calculatePricingPreview } from "@/lib/pricing";
import { addPaise, fromPaise, toPaise } from "@/lib/money";
import type { lineItemInputSchema } from "@/lib/validation";
import type { z } from "zod";

export class LineItemError extends Error {}

export type LineItemInput = z.infer<typeof lineItemInputSchema>;

export type ResolvedLine = {
  productId: number;
  variantId: number | null;
  planId: number;
  productName: string;
  productCode: string | null;
  variantName: string | null;
  planName: string;
  billingPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  quantity: number;
  unitPrice: string;
  variantExtra: string;
  taxRuleId: number | null;
  taxRatePct: string;
  taxAmount: string;
  discountId: number | null;
  discountAmount: string;
  subtotal: string;
  lineTotal: string;
  description: string | null;
};

export type ResolvedLines = {
  lines: ResolvedLine[];
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
};

// Server-authoritative pricing — never trusts client-supplied totals. Loads
// every referenced product/variant/plan/tax/discount fresh, validates active
// status and scope, and reuses Phase 2's calculatePricingPreview per line so
// the money math stays identical (and decimal-safe) everywhere in the app.
export async function resolveLineItems(tx: Tx, lines: LineItemInput[]): Promise<ResolvedLines> {
  if (lines.length === 0) throw new LineItemError("At least one line is required");

  const productIds = [...new Set(lines.map((l) => l.productId))];
  const variantIds = [...new Set(lines.map((l) => l.variantId).filter((v): v is number => v !== undefined))];
  const planIds = [...new Set(lines.map((l) => l.planId))];
  const taxRuleIds = [...new Set(lines.map((l) => l.taxRuleId).filter((v): v is number => v !== undefined))];
  const discountIds = [...new Set(lines.map((l) => l.discountId).filter((v): v is number => v !== undefined))];

  const [productRows, variantRows, planRows, taxRuleRows, discountRows] = await Promise.all([
    tx.select().from(products).where(inArray(products.id, productIds)),
    variantIds.length ? tx.select().from(productVariants).where(inArray(productVariants.id, variantIds)) : Promise.resolve([]),
    tx.select().from(plans).where(inArray(plans.id, planIds)),
    taxRuleIds.length ? tx.select().from(taxRules).where(inArray(taxRules.id, taxRuleIds)) : Promise.resolve([]),
    discountIds.length ? tx.select().from(discounts).where(inArray(discounts.id, discountIds)) : Promise.resolve([]),
  ]);

  const productMap = new Map(productRows.map((p) => [p.id, p]));
  const variantMap = new Map(variantRows.map((v) => [v.id, v]));
  const planMap = new Map(planRows.map((p) => [p.id, p]));
  const taxRuleMap = new Map(taxRuleRows.map((t) => [t.id, t]));
  const discountMap = new Map(discountRows.map((d) => [d.id, d]));

  const resolved: ResolvedLine[] = [];
  let subtotalPaise = 0n;
  let discountPaise = 0n;
  let taxPaise = 0n;
  let grandPaise = 0n;

  for (const line of lines) {
    const product = productMap.get(line.productId);
    if (!product) throw new LineItemError(`Product ${line.productId} not found`);
    if (product.status !== "ACTIVE") throw new LineItemError(`Product "${product.name}" is not active`);

    let variant = null;
    if (line.variantId !== undefined) {
      variant = variantMap.get(line.variantId) ?? null;
      if (!variant || variant.productId !== product.id) throw new LineItemError(`Variant not found for product "${product.name}"`);
      if (!variant.active) throw new LineItemError(`Variant "${variant.name}" is not active`);
    }

    const plan = planMap.get(line.planId);
    if (!plan || plan.productId !== product.id) throw new LineItemError(`Plan not found for product "${product.name}"`);
    if (!plan.active) throw new LineItemError(`Plan "${plan.name}" is not active`);
    if (line.quantity < plan.minQuantity) throw new LineItemError(`Quantity for "${product.name}" must be at least ${plan.minQuantity}`);

    let taxRule = null;
    if (line.taxRuleId !== undefined) {
      taxRule = taxRuleMap.get(line.taxRuleId) ?? null;
      if (!taxRule) throw new LineItemError(`Tax rule not found`);
      if (!taxRule.active) throw new LineItemError(`Tax rule "${taxRule.name}" is not active`);
      if (taxRule.productId !== null && taxRule.productId !== product.id) {
        throw new LineItemError(`Tax rule "${taxRule.name}" does not apply to "${product.name}"`);
      }
    }

    let discount = null;
    if (line.discountId !== undefined) {
      discount = discountMap.get(line.discountId) ?? null;
      if (!discount) throw new LineItemError(`Discount not found`);
    }

    const preview = calculatePricingPreview({
      basePrice: product.salesPrice,
      variantExtraPrice: variant?.extraPrice,
      quantity: line.quantity,
      productId: product.id,
      discount: discount
        ? {
            type: discount.type,
            value: discount.value,
            scope: discount.scope,
            productId: discount.productId,
            minPurchase: discount.minPurchase,
            minQuantity: discount.minQuantity,
            startDate: discount.startDate,
            endDate: discount.endDate,
            usageLimit: discount.usageLimit,
            usedCount: discount.usedCount,
            active: discount.active,
          }
        : null,
      taxRatePct: taxRule?.rate,
    });

    if (discount && !preview.discountApplied) {
      throw new LineItemError(`Discount "${discount.name}" cannot be applied to "${product.name}": ${preview.discountRejectReason}`);
    }

    resolved.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      planId: plan.id,
      productName: product.name,
      productCode: product.sku,
      variantName: variant?.name ?? null,
      planName: plan.name,
      billingPeriod: plan.billingPeriod,
      quantity: line.quantity,
      unitPrice: preview.basePrice,
      variantExtra: preview.variantExtra,
      taxRuleId: taxRule?.id ?? null,
      taxRatePct: preview.taxRatePct,
      taxAmount: preview.taxAmount,
      discountId: discount?.id ?? null,
      discountAmount: preview.discountAmount,
      subtotal: preview.subtotal,
      lineTotal: preview.total,
      description: line.description ?? null,
    });

    subtotalPaise = addPaise(subtotalPaise, toPaise(preview.subtotal));
    discountPaise = addPaise(discountPaise, toPaise(preview.discountAmount));
    taxPaise = addPaise(taxPaise, toPaise(preview.taxAmount));
    grandPaise = addPaise(grandPaise, toPaise(preview.total));
  }

  return {
    lines: resolved,
    subtotal: fromPaise(subtotalPaise),
    discountTotal: fromPaise(discountPaise),
    taxTotal: fromPaise(taxPaise),
    grandTotal: fromPaise(grandPaise),
  };
}

export type TemplateLineDefault = LineItemInput & { unitPrice: string };

// Template lines are reusable *defaults*, not locked commercial snapshots —
// just resolve a current base+variant price as a starting reference value.
export async function resolveTemplateLineDefaults(lines: LineItemInput[]) {
  const withPrice: TemplateLineDefault[] = [];
  for (const line of lines) {
    const [product] = await db.select({ id: products.id, name: products.name, salesPrice: products.salesPrice }).from(products).where(eq(products.id, line.productId)).limit(1);
    if (!product) return { error: `Product ${line.productId} not found` } as const;

    let variantExtra = "0";
    if (line.variantId) {
      const [variant] = await db.select({ productId: productVariants.productId, extraPrice: productVariants.extraPrice }).from(productVariants).where(eq(productVariants.id, line.variantId)).limit(1);
      if (!variant || variant.productId !== product.id) return { error: `Variant does not belong to "${product.name}"` } as const;
      variantExtra = variant.extraPrice;
    }

    const [plan] = await db.select({ productId: plans.productId }).from(plans).where(eq(plans.id, line.planId)).limit(1);
    if (!plan || plan.productId !== product.id) return { error: `Plan does not belong to "${product.name}"` } as const;

    withPrice.push({ ...line, unitPrice: fromPaise(addPaise(toPaise(product.salesPrice), toPaise(variantExtra))) });
  }
  return { lines: withPrice } as const;
}
