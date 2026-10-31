import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";

import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const templateLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
});

const createTemplateSchema = z.object({
  name: z.string().min(2, "Template name is required"),
  planId: z.string().min(1, "Plan is required"),
  validityDays: z.number().int().min(1).default(15),
  notes: z.string().optional(),
  lines: z.array(templateLineSchema).min(1, "At least one line item is required"),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const templates = await prisma.quotationTemplate.findMany({
      where: { isActive: true },
      include: {
        plan: true,
        lines: {
          include: { product: true, variant: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const body = await req.json();
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, planId, validityDays, notes, lines } = parsed.data;

    const template = await prisma.quotationTemplate.create({
      data: {
        name,
        planId,
        validityDays,
        notes,
        lines: {
          create: lines.map((l, index) => ({
            productId: l.productId,
            variantId: l.variantId || null,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            sortOrder: index,
          })),
        },
      },
      include: {
        plan: true,
        lines: {
          include: { product: true, variant: true },
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

