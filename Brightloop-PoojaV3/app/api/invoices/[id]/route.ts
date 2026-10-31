import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        subscription: { include: { plan: true } },
        lines: {
          include: { tax: true },
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          orderBy: { date: "asc" },
        },
        discount: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Customer isolation check (Section 4 & Section 14 Spec)
    if (user.role === "CUSTOMER" && invoice.customerId !== user.customerId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const paidAmount = invoice.payments
      .filter((p) => !p.isReversal)
      .reduce((sum, p) => sum + p.amount.toNumber(), 0);

    const reversedAmount = invoice.payments
      .filter((p) => p.isReversal)
      .reduce((sum, p) => sum + p.amount.toNumber(), 0);

    const netPaid = Math.max(0, paidAmount - reversedAmount);
    const grandTotal = invoice.grandTotal.toNumber();
    const balanceDue = Math.max(0, Math.round((grandTotal - netPaid) * 100) / 100);

    const isOverdue =
      invoice.status === "CONFIRMED" && balanceDue > 0 && new Date(invoice.dueDate) < new Date();

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        isOverdue,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        dueDate: invoice.dueDate,
        subtotal: invoice.subtotal.toNumber(),
        discountTotal: invoice.discountTotal.toNumber(),
        taxTotal: invoice.taxTotal.toNumber(),
        grandTotal,
        netPaid,
        balanceDue,
        sentAt: invoice.sentAt,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
        customer: {
          id: invoice.customer.id,
          name: invoice.customer.user.name,
          email: invoice.customer.user.email,
          companyName: invoice.customer.companyName,
          address: invoice.customer.address,
          city: invoice.customer.city,
          state: invoice.customer.state,
          pincode: invoice.customer.pincode,
          gstin: invoice.customer.gstin,
        },
        subscription: {
          id: invoice.subscription.id,
          number: invoice.subscription.number,
          planName: invoice.subscription.plan.name,
        },
        discount: invoice.discount
          ? {
              id: invoice.discount.id,
              name: invoice.discount.name,
              type: invoice.discount.type,
              value: invoice.discount.value.toNumber(),
            }
          : null,
        lines: invoice.lines.map((l) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice.toNumber(),
          discount: l.discount.toNumber(),
          taxRate: l.taxRate.toNumber(),
          taxAmount: l.taxAmount.toNumber(),
          amount: l.amount.toNumber(),
        })),
        payments: invoice.payments.map((p) => ({
          id: p.id,
          method: p.method,
          amount: p.amount.toNumber(),
          date: p.date,
          note: p.note,
          isReversal: p.isReversal,
        })),
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

