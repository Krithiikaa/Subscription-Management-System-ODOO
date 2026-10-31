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
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const check = validateInvoiceTransition(invoice.status, "CONFIRMED");
    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    return NextResponse.json({
      message: `Invoice ${invoice.number} confirmed successfully`,
      invoice: updated,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

