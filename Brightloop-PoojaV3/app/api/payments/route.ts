import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { validatePayment } from "@/lib/payments/engine";
import { PaymentMethod } from "@prisma/client";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "UPI", "CHEQUE"]),
  amount: z.number().positive("Payment amount must be > 0"),
  date: z.string().optional(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");

    const payments = await prisma.payment.findMany({
      where: invoiceId ? { invoiceId } : undefined,
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            customer: { select: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoice.number,
      customerName: p.invoice.customer.user.name,
      method: p.method,
      amount: p.amount.toNumber(),
      date: p.date,
      note: p.note,
      isReversal: p.isReversal,
      reversalOf: p.reversalOf,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ payments: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const body = await req.json();
    const parsed = recordPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { invoiceId, method, amount, date, note } = parsed.data;

    // Load invoice with existing payments in transaction
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const existingPayments = invoice.payments.map((p) => ({
        amount: p.amount.toNumber(),
        isReversal: p.isReversal,
      }));

      const validation = validatePayment(
        {
          status: invoice.status,
          grandTotal: invoice.grandTotal.toNumber(),
        },
        existingPayments,
        amount
      );

      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Create Payment entry
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          method: method as PaymentMethod,
          amount,
          date: date ? new Date(date) : new Date(),
          note,
        },
      });

      // If fully covered, flip status to PAID
      if (validation.willBePaid) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID" },
        });
      }

      return {
        payment,
        balanceAfter: validation.balanceAfter,
        status: validation.willBePaid ? "PAID" : invoice.status,
      };
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully",
        payment: result.payment,
        balanceRemaining: result.balanceAfter,
        invoiceStatus: result.status,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record payment" },
      { status: 400 }
    );
  }
}

