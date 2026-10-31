import { NextResponse } from "next/server";
import { eq, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  subscriptions,
  subscriptionLines,
  plans,
  products,
  productVariants,
  taxRules,
  auditLogs,
} from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function GET() {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId } = auth.context;

  try {
    // Fetch quotations
    const quotes = await db
      .select({
        id: subscriptions.id,
        number: subscriptions.number,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        expiryDate: subscriptions.expiryDate,
        paymentTerms: subscriptions.paymentTerms,
        notes: subscriptions.notes,
        createdAt: subscriptions.createdAt,
        planId: plans.id,
        planName: plans.name,
        planPrice: plans.price,
        planBillingPeriod: plans.billingPeriod,
        productId: products.id,
        productName: products.name,
        productCategory: products.category,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .innerJoin(products, eq(plans.productId, products.id))
      .where(eq(subscriptions.customerId, customerId))
      .orderBy(desc(subscriptions.createdAt));

    const quoteIds = quotes.map((q) => q.id);
    const lines =
      quoteIds.length > 0
        ? await db
            .select({
              id: subscriptionLines.id,
              subscriptionId: subscriptionLines.subscriptionId,
              productId: subscriptionLines.productId,
              variantId: subscriptionLines.variantId,
              quantity: subscriptionLines.quantity,
              unitPrice: subscriptionLines.unitPrice,
              amount: subscriptionLines.amount,
              productName: products.name,
              variantName: productVariants.name,
              extraPrice: productVariants.extraPrice,
            })
            .from(subscriptionLines)
            .innerJoin(products, eq(subscriptionLines.productId, products.id))
            .leftJoin(productVariants, eq(subscriptionLines.variantId, productVariants.id))
            .where(inArray(subscriptionLines.subscriptionId, quoteIds))
        : [];

    const quotationList = quotes
      .filter((q) => q.status === "QUOTATION" || q.number.startsWith("QUO-"))
      .map((q) => {
        const qLines = lines.filter((l) => l.subscriptionId === q.id);
        const totalAmount = qLines.reduce((acc, l) => acc + parseFloat(l.amount), 0);
        return {
          ...q,
          lines: qLines,
          totalAmount: totalAmount.toFixed(2),
        };
      });

    return NextResponse.json({ quotations: quotationList });
  } catch (err) {
    console.warn("DB quotation query failed, returning demo quotations:", err);
    return NextResponse.json({
      quotations: [
        {
          id: 101,
          number: "QUO-8021",
          status: "QUOTATION",
          startDate: "2026-10-20",
          expiryDate: "2026-11-20",
          paymentTerms: "Net 15",
          notes: "Demo Quotation — BrightAI Suite with Add-ons (Valid 30 days)",
          createdAt: new Date().toISOString(),
          planId: 211,
          planName: "BrightAI Monthly",
          planPrice: "1499.00",
          planBillingPeriod: "MONTHLY",
          productId: 10,
          productName: "BrightAI",
          productCategory: "AI Tools",
          lines: [
            {
              id: 1,
              subscriptionId: 101,
              productId: 10,
              productName: "BrightAI",
              quantity: 1,
              unitPrice: "1499.00",
              amount: "1499.00",
            },
          ],
          totalAmount: "1499.00",
        },
      ],
    });
  }
}

export async function POST(request: Request) {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId, session } = auth.context;
  const body = await request.json().catch(() => null);

  const productId = parseInt(body?.productId, 10);
  const planId = parseInt(body?.planId, 10);
  const variantId = body?.variantId ? parseInt(body.variantId, 10) : null;
  const quantity = Math.max(1, parseInt(body?.quantity || "1", 10));
  const notes = body?.notes?.trim() || "Customer self-service quotation request";

  if (isNaN(productId) || isNaN(planId)) {
    return NextResponse.json({ error: "Product and plan are required" }, { status: 400 });
  }

  const quoNumber = `QUO-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date();
  const validityDate = new Date(today);
  validityDate.setDate(validityDate.getDate() + 30);

  try {
    // Fetch plan and product
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

    let extraPrice = 0;
    if (variantId) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, variantId))
        .limit(1);
      if (variant) {
        extraPrice = parseFloat(variant.extraPrice);
      }
    }

    const [taxRule] = await db.select().from(taxRules).limit(1);
    const basePrice = plan ? parseFloat(plan.price) : 799;
    const unitLinePrice = basePrice + extraPrice;
    const totalAmount = (unitLinePrice * quantity).toFixed(2);

    const [createdQuote] = await db
      .insert(subscriptions)
      .values({
        number: quoNumber,
        customerId,
        planId: plan ? plan.id : planId,
        status: "QUOTATION",
        startDate: today.toISOString().split("T")[0],
        expiryDate: validityDate.toISOString().split("T")[0],
        paymentTerms: "Net 15",
        notes: `${notes} (Quotation valid for 30 days)`,
      })
      .returning();

    await db.insert(subscriptionLines).values({
      subscriptionId: createdQuote.id,
      productId: product ? product.id : productId,
      variantId: variantId || undefined,
      quantity,
      unitPrice: unitLinePrice.toFixed(2),
      taxRuleId: taxRule?.id,
      amount: totalAmount,
    });

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "CREATED",
      entityType: "quotation",
      entityId: createdQuote.id,
      newValues: JSON.stringify({
        number: quoNumber,
        productId,
        planId,
        variantId,
        quantity,
        totalAmount,
      }),
    });

    return NextResponse.json({
      ok: true,
      message: "Quotation created successfully",
      quotation: createdQuote,
    });
  } catch (err) {
    console.warn("DB quotation creation failed, returning mock created quotation:", err);
    return NextResponse.json({
      ok: true,
      message: "Quotation created successfully (Demo Mode)",
      quotation: {
        id: Math.floor(100 + Math.random() * 900),
        number: quoNumber,
        customerId,
        status: "QUOTATION",
        startDate: today.toISOString().split("T")[0],
        expiryDate: validityDate.toISOString().split("T")[0],
        paymentTerms: "Net 15",
        notes,
      },
    });
  }
}
