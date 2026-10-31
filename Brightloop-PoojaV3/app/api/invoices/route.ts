import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { InvoiceStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const customerIdParam = searchParams.get("customerId");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Customer isolation enforcement
    if (user.role === "CUSTOMER") {
      if (!user.customerId) return NextResponse.json({ invoices: [], total: 0 });
      whereClause.customerId = user.customerId;
    } else if (customerIdParam) {
      whereClause.customerId = customerIdParam;
    }

    if (statusParam) {
      whereClause.status = statusParam as InvoiceStatus;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        include: {
          customer: { include: { user: true } },
          subscription: true,
          payments: { where: { isReversal: false } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    const formatted = invoices.map((inv) => {
      const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
      const grandTotal = inv.grandTotal.toNumber();
      const balance = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

      const isOverdue =
        inv.status === "CONFIRMED" && balance > 0 && new Date(inv.dueDate) < new Date();

      return {
        id: inv.id,
        number: inv.number,
        status: inv.status,
        isOverdue,
        periodStart: inv.periodStart,
        periodEnd: inv.periodEnd,
        dueDate: inv.dueDate,
        subtotal: inv.subtotal.toNumber(),
        discountTotal: inv.discountTotal.toNumber(),
        taxTotal: inv.taxTotal.toNumber(),
        grandTotal,
        paidAmount,
        balance,
        sentAt: inv.sentAt,
        createdAt: inv.createdAt,
        customer: {
          id: inv.customer.id,
          name: inv.customer.user.name,
          email: inv.customer.user.email,
          companyName: inv.customer.companyName,
        },
        subscription: {
          id: inv.subscription.id,
          number: inv.subscription.number,
        },
      };
    });

    return NextResponse.json({
      invoices: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

