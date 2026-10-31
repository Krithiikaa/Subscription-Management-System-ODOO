import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["ADMIN"]);
    const { id } = await params;

    // Check if product is in use on subscription lines or invoices
    const usedCount = await prisma.subscriptionLine.count({
      where: { productId: id },
    });

    if (usedCount > 0) {
      // Archive instead of delete
      await prisma.product.update({
        where: { id },
        data: { isArchived: true },
      });
      return NextResponse.json({
        message: "Product is used on active/historical subscriptions and was archived instead of deleted.",
        archived: true,
      });
    }

    // Otherwise safe to hard delete
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return handleAuthError(error);
  }
}

