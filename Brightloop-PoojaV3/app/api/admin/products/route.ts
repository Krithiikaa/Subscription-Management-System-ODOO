import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";

import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const productVariantSchema = z.object({
  attribute: z.string().min(1, "Attribute required (e.g. Brand)"),
  value: z.string().min(1, "Value required (e.g. Odoo-compatible)"),
  extraPrice: z.number().min(0, "Extra price must be >= 0").default(0),
});

const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  salesPrice: z.number().min(0, "Sales price must be >= 0"),
  costPrice: z.number().min(0, "Cost price must be >= 0").default(0),
  notes: z.string().optional(),
  variants: z.array(productVariantSchema).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, ["ADMIN", "STAFF"]);
    const isAdmin = user.role === "ADMIN";

    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    // Strip costPrice for non-admin staff per Section 4 Spec
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      salesPrice: p.salesPrice.toNumber(),
      costPrice: isAdmin ? p.costPrice.toNumber() : undefined,
      notes: p.notes,
      variants: p.variants.map((v) => ({
        id: v.id,
        attribute: v.attribute,
        value: v.value,
        extraPrice: v.extraPrice.toNumber(),
      })),
    }));

    return NextResponse.json({ products: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, description, salesPrice, costPrice, notes, variants } = parsed.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        salesPrice,
        costPrice,
        notes,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v) => ({
            attribute: v.attribute,
            value: v.value,
            extraPrice: v.extraPrice,
          })),
        } : undefined,
      },
      include: { variants: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

