import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, invoiceLines, invoices, plans, products, subscriptionLines, subscriptions, taxRules } from "@/db/schema";
import { getDepartmentForProduct } from "@/lib/departments";
import { addPaise, fromPaise, percentOfPaise, toPaise } from "@/lib/money";
import { finalNumber, tempNumber } from "@/lib/numbering";

type SignOffInput = {
  subscriptionId: number;
  signerUserId: number;
  staffName: string;
  staffNotes: string;
};

// Department sign-off: activates a pending quotation (a QUOTATION-status
// subscription) and raises its first invoice, in one transaction. Shared by
// the staff route (/api/subscriptions/[id]/sign-off) and the customer portal.
export async function signOffQuotation({ subscriptionId, signerUserId, staffName, staffNotes }: SignOffInput) {
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!sub) throw new Error("Quotation not found");

  const lines = await db.select().from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, subscriptionId));
  const planId = sub.planId ?? lines[0]?.planId ?? null;
  const [plan] = planId ? await db.select().from(plans).where(eq(plans.id, planId)).limit(1) : [null];
  const [product] = plan ? await db.select().from(products).where(eq(products.id, plan.productId)).limit(1) : [null];
  const deptInfo = getDepartmentForProduct(product?.name, product?.category);

  const taxRuleIds = lines.map((l) => l.taxRuleId).filter((id): id is number => id !== null);
  const [lineTaxRules, [defaultTaxRule]] = await Promise.all([
    taxRuleIds.length ? db.select().from(taxRules).where(inArray(taxRules.id, taxRuleIds)) : Promise.resolve([]),
    db.select().from(taxRules).where(eq(taxRules.code, "GST18")).limit(1),
  ]);
  const productRows = lines.length
    ? await db.select({ id: products.id, name: products.name }).from(products).where(inArray(products.id, lines.map((l) => l.productId)))
    : [];

  // Lines created through the staff/admin flow already carry tax (amount =
  // subtotal - discount + tax); portal-requested lines are pre-tax. Invoice
  // each accordingly so tax is never charged twice.
  const invoiceLineValues = lines.map((l) => {
    const taxRule = lineTaxRules.find((t) => t.id === l.taxRuleId) ?? defaultTaxRule ?? null;
    const alreadyTaxed = toPaise(l.taxAmount) > 0n;
    const taxRatePct = alreadyTaxed ? l.taxRatePct : (taxRule?.rate ?? "0");
    const taxPaise = alreadyTaxed ? toPaise(l.taxAmount) : percentOfPaise(toPaise(l.amount), taxRatePct);
    const netPaise = alreadyTaxed ? toPaise(l.amount) - taxPaise : toPaise(l.amount);
    const values = {
      productId: l.productId,
      variantId: l.variantId,
      description: `${l.productName ?? productRows.find((p) => p.id === l.productId)?.name ?? "Software"} - ${l.planName ?? plan?.name ?? "Plan"}`,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      variantExtra: l.variantExtra,
      taxRuleId: alreadyTaxed ? l.taxRuleId : taxRule?.id,
      taxRatePct,
      taxAmount: fromPaise(taxPaise),
      discountId: l.discountId,
      discountAmount: l.discountAmount,
      lineTotal: fromPaise(netPaise + taxPaise),
    };
    return { values, netPaise, taxPaise, discountPaise: toPaise(l.discountAmount) };
  });

  const subtotal = invoiceLineValues.reduce((acc, l) => addPaise(acc, l.netPaise + l.discountPaise), 0n);
  const discount = invoiceLineValues.reduce((acc, l) => addPaise(acc, l.discountPaise), 0n);
  const tax = invoiceLineValues.reduce((acc, l) => addPaise(acc, l.taxPaise), 0n);
  const total = subtotal - discount + tax;

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 7);
  const signatureCode = `SIG-${deptInfo.approvalCode}-${Date.now().toString(36).toUpperCase()}`;

  return db.transaction(async (tx) => {
    // 1. Activate subscription with department staff approval signature
    const [activatedSub] = await tx
      .update(subscriptions)
      .set({
        number: finalNumber("SUB", subscriptionId),
        status: "ACTIVE",
        planId: planId ?? undefined,
        startDate: today.toISOString().split("T")[0],
        nextBillingDate: nextMonth.toISOString().split("T")[0],
        notes: `Digitally signed by ${staffName} (${deptInfo.department}). Signature: ${signatureCode}. ${staffNotes}`,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    // 2. Create invoice
    const [created] = await tx
      .insert(invoices)
      .values({
        number: tempNumber("INV"),
        subscriptionId,
        customerId: sub.customerId,
        status: "CONFIRMED",
        periodStart: today.toISOString().split("T")[0],
        periodEnd: nextMonth.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        subtotal: fromPaise(subtotal),
        taxAmount: fromPaise(tax),
        discountAmount: fromPaise(discount),
        total: fromPaise(total),
        amountPaid: "0.00",
        sentAt: new Date(),
      })
      .returning();
    const [newInvoice] = await tx
      .update(invoices)
      .set({ number: finalNumber("INV", created.id) })
      .where(eq(invoices.id, created.id))
      .returning();

    // 3. Create invoice lines
    if (invoiceLineValues.length > 0) {
      await tx.insert(invoiceLines).values(
        invoiceLineValues.map((l) => ({ ...l.values, invoiceId: newInvoice.id }))
      );
    }

    // 4. Audit log with department staff signature
    await tx.insert(auditLogs).values({
      userId: signerUserId,
      action: "STATUS_CHANGED",
      entityType: "quotation",
      entityId: subscriptionId,
      oldValues: JSON.stringify({ status: sub.status }),
      newValues: JSON.stringify({
        status: "ACTIVE",
        signedByStaff: staffName,
        department: deptInfo.department,
        signatureCode,
        invoiceGenerated: newInvoice.number,
        signedAt: today.toISOString(),
      }),
    });

    return { activatedSub, newInvoice, signatureCode, department: deptInfo.department };
  });
}
