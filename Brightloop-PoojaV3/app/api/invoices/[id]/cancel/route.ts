import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { validateInvoiceTransition } from "@/lib/invoices/actions";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: { where: { isReversal: false } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const check = validateInvoiceTransition(invoice.status, "CANCELLED", invoice.payments.length);
    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    // Cancel and restore discount usage in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // Restore discount usage count if discount was applied
      if (invoice.discountId) {
        await tx.discount.update({
          where: { id: invoice.discountId },
          data: { usageCount: { decrement: 1 } },
        });
      }

      return inv;
    });

    return NextResponse.json({
      message: `Invoice ${invoice.number} cancelled and discount usage restored`,
      invoice: updated,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

