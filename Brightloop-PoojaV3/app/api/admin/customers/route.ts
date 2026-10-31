import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.user.name,
      email: c.user.email,
      companyName: c.companyName,
      phone: c.phone,
      city: c.city,
      gstin: c.gstin,
      isActive: c.user.isActive,
      subscriptionsCount: c.subscriptions.length,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}
