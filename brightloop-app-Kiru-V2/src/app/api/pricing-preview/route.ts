import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { discounts, plans, productVariants, products, taxRules } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { calculatePricingPreview } from "@/lib/pricing";
import { pricingPreviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = pricingPreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { productId, variantId, planId, quantity, taxRuleId, discountId } = parsed.data;

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product is not active" }, { status: 409 });
  }

  let variant = null;
  if (variantId) {
    const [v] = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1);
    if (!v || v.productId !== productId) {
      return NextResponse.json({ error: "Variant not found for this product" }, { status: 404 });
    }
    if (!v.active) {
      return NextResponse.json({ error: "Variant is not active" }, { status: 409 });
    }
    variant = v;
  }

  let plan = null;
  if (planId) {
    const [p] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!p || p.productId !== productId) {
      return NextResponse.json({ error: "Plan not found for this product" }, { status: 404 });
    }
    if (!p.active) {
      return NextResponse.json({ error: "Plan is not active" }, { status: 409 });
    }
    if (quantity < p.minQuantity) {
      return NextResponse.json({ error: `Quantity must be at least ${p.minQuantity} for this plan` }, { status: 400 });
    }
    plan = p;
  }

  let taxRule = null;
  if (taxRuleId) {
    const [t] = await db.select().from(taxRules).where(eq(taxRules.id, taxRuleId)).limit(1);
    if (!t) {
      return NextResponse.json({ error: "Tax rule not found" }, { status: 404 });
    }
    if (!t.active) {
      return NextResponse.json({ error: "Tax rule is not active" }, { status: 409 });
    }
    if (t.productId !== null && t.productId !== productId) {
      return NextResponse.json({ error: "Tax rule does not apply to this product" }, { status: 409 });
    }
    taxRule = t;
  }

  let discount = null;
  if (discountId) {
    const [d] = await db.select().from(discounts).where(eq(discounts.id, discountId)).limit(1);
    if (!d) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }
    discount = d;
  }

  const result = calculatePricingPreview({
    basePrice: product.salesPrice,
    variantExtraPrice: variant?.extraPrice,
    quantity,
    productId,
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

  return NextResponse.json({
    preview: result,
    product: { id: product.id, name: product.name, currency: product.currency },
    variant: variant ? { id: variant.id, name: variant.name } : null,
    plan: plan ? { id: plan.id, name: plan.name, billingPeriod: plan.billingPeriod } : null,
    taxRule: taxRule ? { id: taxRule.id, name: taxRule.name, rate: taxRule.rate } : null,
    discount: discount ? { id: discount.id, name: discount.name } : null,
  });
}
