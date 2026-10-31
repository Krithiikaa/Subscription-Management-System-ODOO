import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const reverseSchema = z.object({
  note: z.string().min(3, "Reason for reversal is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["ADMIN"]);
    const { id } = await params;

    const body = await req.json();
    const parsed = reverseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { note } = parsed.data;

    const originalPayment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!originalPayment) {
      return NextResponse.json({ error: "Original payment not found" }, { status: 404 });
    }

    if (originalPayment.isReversal) {
      return NextResponse.json(
        { error: "Cannot reverse a reversal entry." },
        { status: 400 }
      );
    }

    // Check if already reversed
    const existingReversal = await prisma.payment.findFirst({
      where: { reversalOf: id },
    });

    if (existingReversal) {
      return NextResponse.json(
        { error: "This payment has already been reversed." },
        { status: 400 }
      );
    }

    // Execute reversal in transaction
    const reversal = await prisma.$transaction(async (tx) => {
      // 1. Create reversal row
      const rev = await tx.payment.create({
        data: {
          invoiceId: originalPayment.invoiceId,
          method: originalPayment.method,
          amount: originalPayment.amount,
          date: new Date(),
          note: `Reversal of payment ${id}: ${note}`,
          isReversal: true,
          reversalOf: id,
        },
      });

      // 2. If invoice was PAID, revert back to CONFIRMED
      if (originalPayment.invoice.status === "PAID") {
        await tx.invoice.update({
          where: { id: originalPayment.invoiceId },
          data: { status: "CONFIRMED" },
        });
      }

      return rev;
    });

    return NextResponse.json({
      message: "Payment successfully reversed",
      reversal,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

