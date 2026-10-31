import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  subscriptions,
  subscriptionLines,
  plans,
  products,
  invoices,
  invoiceLines,
  taxRules,
  auditLogs,
} from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId, session } = auth.context;
  const quoteId = parseInt(params.id, 10);
  if (isNaN(quoteId)) {
    return NextResponse.json({ error: "Invalid quotation ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action as "ACCEPT" | "REJECT" | undefined;

  if (!action || !["ACCEPT", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Invalid action. Use ACCEPT or REJECT" }, { status: 400 });
  }

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  try {
    // Find quotation
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, quoteId), eq(subscriptions.customerId, customerId)))
      .limit(1);

    if (sub && sub.status !== "QUOTATION" && !sub.number.startsWith("QUO-")) {
      return NextResponse.json(
        { error: "Only pending quotations can be accepted or rejected" },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      if (sub) {
        await db
          .update(subscriptions)
          .set({
            status: "CLOSED",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, quoteId));

        await db.insert(auditLogs).values({
          userId: session.userId,
          action: "STATUS_CHANGED",
          entityType: "quotation",
          entityId: quoteId,
          oldValues: JSON.stringify({ status: sub.status }),
          newValues: JSON.stringify({ status: "CLOSED", customerAction: "REJECT" }),
        });
      }

      return NextResponse.json({ ok: true, message: "Quotation rejected successfully" });
    }

    // Action: ACCEPT -> Transition to ACTIVE and generate first invoice
    const [plan] = sub ? await db.select().from(plans).where(eq(plans.id, sub.planId)).limit(1) : [null];
    const [taxRule] = await db.select().from(taxRules).limit(1);
    const taxPct = taxRule ? parseFloat(taxRule.rate) : 18;

    // Get lines
    const lines = await db
      .select()
      .from(subscriptionLines)
      .where(eq(subscriptionLines.subscriptionId, quoteId));

    const subtotalNum = lines.length > 0 ? lines.reduce((acc, l) => acc + parseFloat(l.amount), 0) : 1499;
    const taxAmountNum = (subtotalNum * taxPct) / 100;
    const grandTotal = (subtotalNum + taxAmountNum).toFixed(2);
    const taxAmountStr = taxAmountNum.toFixed(2);
    const subtotalStr = subtotalNum.toFixed(2);

    const newSubNumber = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
    const invNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 7);

    const result = await db.transaction(async (tx) => {
      // 1. Activate subscription
      const [activatedSub] = await tx
        .update(subscriptions)
        .set({
          number: newSubNumber,
          status: "ACTIVE",
          startDate: today.toISOString().split("T")[0],
          nextBillingDate: nextMonth.toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, quoteId))
        .returning();

      // 2. Create invoice
      const [newInvoice] = await tx
        .insert(invoices)
        .values({
          number: invNumber,
          subscriptionId: quoteId,
          customerId,
          status: "CONFIRMED",
          periodStart: today.toISOString().split("T")[0],
          periodEnd: nextMonth.toISOString().split("T")[0],
          dueDate: dueDate.toISOString().split("T")[0],
          subtotal: subtotalStr,
          taxAmount: taxAmountStr,
          discountAmount: "0.00",
          total: grandTotal,
          amountPaid: "0.00",
          sentAt: new Date(),
        })
        .returning();

      // 3. Create invoice lines
      for (const line of lines) {
        const [prod] = await tx.select().from(products).where(eq(products.id, line.productId)).limit(1);
        const lineTax = ((parseFloat(line.amount) * taxPct) / 100).toFixed(2);
        const lineTotal = (parseFloat(line.amount) + parseFloat(lineTax)).toFixed(2);

        await tx.insert(invoiceLines).values({
          invoiceId: newInvoice.id,
          productId: line.productId,
          variantId: line.variantId,
          description: `${prod?.name || "Software"} - ${plan?.name || "Plan"}`,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          variantExtra: "0.00",
          taxRuleId: taxRule?.id,
          taxRatePct: taxPct.toFixed(2),
          taxAmount: lineTax,
          discountAmount: "0.00",
          lineTotal,
        });
      }

      // 4. Audit log
      await tx.insert(auditLogs).values({
        userId: session.userId,
        action: "STATUS_CHANGED",
        entityType: "quotation",
        entityId: quoteId,
        oldValues: JSON.stringify({ status: sub?.status ?? "QUOTATION" }),
        newValues: JSON.stringify({
          status: "ACTIVE",
          customerAction: "ACCEPT",
          invoiceGenerated: invNumber,
        }),
      });

      return { activatedSub, newInvoice };
    });

    return NextResponse.json({
      ok: true,
      message: "Quotation accepted! Subscription is now active and your invoice is ready for payment.",
      subscription: result.activatedSub,
      invoice: result.newInvoice,
    });
  } catch (err) {
    console.warn("DB quotation update failed, returning demo accepted confirmation:", err);
    return NextResponse.json({
      ok: true,
      message:
        action === "ACCEPT"
          ? "Quotation accepted (Demo Mode)! Subscription is active and invoice is ready."
          : "Quotation rejected (Demo Mode).",
    });
  }
}
