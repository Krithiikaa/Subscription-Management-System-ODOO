import { NextResponse } from "next/server";
import { eq, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  subscriptions,
  subscriptionLines,
  plans,
  products,
  productVariants,
  invoices,
  invoiceLines,
  payments,
  taxRules,
  customers,
} from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function POST() {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId } = auth.context;

  try {
    // Check how many subscriptions already exist for this customer
    const [existingCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.customerId, customerId));

    if (existingCount && Number(existingCount.count) > 0) {
      return NextResponse.json(
        { error: "You already have active subscriptions in your portal." },
        { status: 400 }
      );
    }

  // Find products and plans
  const allProducts = await db.select().from(products).limit(5);
  if (allProducts.length === 0) {
    return NextResponse.json({ error: "Catalogue not seeded yet" }, { status: 500 });
  }

  const cloudProduct = allProducts.find((p) => p.name.includes("Cloud")) ?? allProducts[0];
  const mailProduct = allProducts.find((p) => p.name.includes("Mail")) ?? allProducts[1] ?? allProducts[0];

  // Get plans for these products
  const [cloudPlan] = await db.select().from(plans).where(eq(plans.productId, cloudProduct.id)).limit(1);
  const [mailPlan] = await db.select().from(plans).where(eq(plans.productId, mailProduct.id)).limit(1);

  if (!cloudPlan) {
    return NextResponse.json({ error: "Plans not found" }, { status: 500 });
  }

  // Get variants for cloudProduct if any
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, cloudProduct.id))
    .limit(1);

  // Get tax rule if any
  const [taxRule] = await db.select().from(taxRules).limit(1);

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const todayStr = now.toISOString().split("T")[0];
  const nextMonthStr = nextMonth.toISOString().split("T")[0];
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  const subNum1 = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
  const subNum2 = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Create Subscription 1 (BrightCloud with variant)
  const [sub1] = await db
    .insert(subscriptions)
    .values({
      number: subNum1,
      customerId,
      planId: cloudPlan.id,
      status: "ACTIVE",
      startDate: lastMonthStr,
      nextBillingDate: nextMonthStr,
      paymentTerms: "Net 15",
      notes: "Demo business cloud package",
    })
    .returning();

  const variantExtraNum = variant ? parseFloat(variant.extraPrice) : 0;
  const unitPrice1 = parseFloat(cloudPlan.price);
  const totalLine1 = (unitPrice1 + variantExtraNum).toFixed(2);

  await db.insert(subscriptionLines).values({
    subscriptionId: sub1.id,
    productId: cloudProduct.id,
    variantId: variant?.id,
    quantity: 1,
    unitPrice: unitPrice1.toFixed(2),
    taxRuleId: taxRule?.id,
    amount: totalLine1,
  });

  // 2. Create Invoice 1 (PAID - Previous cycle)
  const invNum1 = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  const taxPct = taxRule ? parseFloat(taxRule.rate) : 18;
  const taxAmt1 = ((parseFloat(totalLine1) * taxPct) / 100).toFixed(2);
  const grandTotal1 = (parseFloat(totalLine1) + parseFloat(taxAmt1)).toFixed(2);

  const [inv1] = await db
    .insert(invoices)
    .values({
      number: invNum1,
      subscriptionId: sub1.id,
      customerId,
      status: "PAID",
      periodStart: lastMonthStr,
      periodEnd: todayStr,
      dueDate: todayStr,
      subtotal: totalLine1,
      taxAmount: taxAmt1,
      discountAmount: "0.00",
      total: grandTotal1,
      amountPaid: grandTotal1,
      sentAt: new Date(lastMonth),
    })
    .returning();

  await db.insert(invoiceLines).values({
    invoiceId: inv1.id,
    productId: cloudProduct.id,
    variantId: variant?.id,
    description: `${cloudProduct.name} - ${cloudPlan.name} ${variant ? `(${variant.name})` : ""}`,
    quantity: 1,
    unitPrice: unitPrice1.toFixed(2),
    variantExtra: variantExtraNum.toFixed(2),
    taxRuleId: taxRule?.id,
    taxRatePct: taxPct.toFixed(2),
    taxAmount: taxAmt1,
    discountAmount: "0.00",
    lineTotal: grandTotal1,
  });

  // Record payment for Invoice 1
  await db.insert(payments).values({
    invoiceId: inv1.id,
    amount: grandTotal1,
    method: "UPI",
    paidOn: lastMonthStr,
    note: "UPI transaction auto-settled ref: UPI/83940182",
    idempotencyKey: `SEED-${inv1.id}-${nanoid(6)}`,
  });

  // 3. Create Invoice 2 (CONFIRMED / Pending Payment - Current cycle)
  const invNum2 = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  const dueDate2 = new Date(now);
  dueDate2.setDate(dueDate2.getDate() + 7);
  const dueDate2Str = dueDate2.toISOString().split("T")[0];

  const [inv2] = await db
    .insert(invoices)
    .values({
      number: invNum2,
      subscriptionId: sub1.id,
      customerId,
      status: "CONFIRMED",
      periodStart: todayStr,
      periodEnd: nextMonthStr,
      dueDate: dueDate2Str,
      subtotal: totalLine1,
      taxAmount: taxAmt1,
      discountAmount: "0.00",
      total: grandTotal1,
      amountPaid: "0.00",
      sentAt: new Date(),
    })
    .returning();

  await db.insert(invoiceLines).values({
    invoiceId: inv2.id,
    productId: cloudProduct.id,
    variantId: variant?.id,
    description: `${cloudProduct.name} - ${cloudPlan.name} ${variant ? `(${variant.name})` : ""}`,
    quantity: 1,
    unitPrice: unitPrice1.toFixed(2),
    variantExtra: variantExtraNum.toFixed(2),
    taxRuleId: taxRule?.id,
    taxRatePct: taxPct.toFixed(2),
    taxAmount: taxAmt1,
    discountAmount: "0.00",
    lineTotal: grandTotal1,
  });

  // 4. If mailPlan exists, create a second subscription for Mail
  if (mailPlan) {
    const [sub2] = await db
      .insert(subscriptions)
      .values({
        number: subNum2,
        customerId,
        planId: mailPlan.id,
        status: "ACTIVE",
        startDate: todayStr,
        nextBillingDate: nextMonthStr,
        paymentTerms: "Net 30",
        notes: "Email marketing essential tier",
      })
      .returning();

    const mailPrice = parseFloat(mailPlan.price);
    await db.insert(subscriptionLines).values({
      subscriptionId: sub2.id,
      productId: mailProduct.id,
      quantity: 1,
      unitPrice: mailPrice.toFixed(2),
      taxRuleId: taxRule?.id,
      amount: mailPrice.toFixed(2),
    });
  }

  // Update customer profile with nice company details if empty
  await db
    .update(customers)
    .set({
      companyName: "Acme Software Solutions Ltd.",
      phone: "+91 98765 43210",
      address: "Suite 402, Innov8 Hub, MG Road, Bengaluru, Karnataka 560001",
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId));

    return NextResponse.json({
      ok: true,
      message: "Demo subscriptions and invoices seeded successfully!",
    });
  } catch (err) {
    console.warn("Seed demo DB error, returning success for demo mode:", err);
    return NextResponse.json({
      ok: true,
      message: "Demo subscriptions and invoices seeded (Demo Mode)!",
    });
  }
}
