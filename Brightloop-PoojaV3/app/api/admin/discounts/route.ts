import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { DiscountType } from "@prisma/client";

import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const createDiscountSchema = z.object({
  name: z.string().min(2, "Discount name is required"),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.number().positive("Value must be > 0"),
  minAmount: z.number().min(0).optional().nullable(),
  minQuantity: z.number().int().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  appliesToAll: z.boolean().default(false),
  productIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const discounts = await prisma.discount.findMany({
      include: {
        discountProducts: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = discounts.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      value: d.value.toNumber(),
      minAmount: d.minAmount ? d.minAmount.toNumber() : null,
      minQuantity: d.minQuantity,
      startDate: d.startDate,
      endDate: d.endDate,
      usageLimit: d.usageLimit,
      usageCount: d.usageCount,
      appliesToAll: d.appliesToAll,
      isActive: d.isActive,
      products: d.discountProducts.map((dp) => ({
        id: dp.product.id,
        name: dp.product.name,
      })),
    }));

    return NextResponse.json({ discounts: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only Admin can create discounts (Staff will get 403 per spec!)
    await requireAuth(req, ["ADMIN"]);

    const body = await req.json();
    const parsed = createDiscountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      name,
      type,
      value,
      minAmount,
      minQuantity,
      startDate,
      endDate,
      usageLimit,
      appliesToAll,
      productIds,
    } = parsed.data;

    const discount = await prisma.discount.create({
      data: {
        name,
        type: type as DiscountType,
        value,
        minAmount: minAmount || null,
        minQuantity: minQuantity || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit || null,
        appliesToAll,
        discountProducts:
          !appliesToAll && productIds && productIds.length > 0
            ? {
                create: productIds.map((pId) => ({
                  productId: pId,
                })),
              }
            : undefined,
      },
    });

    return NextResponse.json({ discount }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

