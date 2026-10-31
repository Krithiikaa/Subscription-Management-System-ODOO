import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const createTaxSchema = z.object({
  name: z.string().min(2, "Tax name is required (e.g. GST 18%)"),
  percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const taxes = await prisma.tax.findMany({
      where: { isActive: true },
      orderBy: { percentage: "asc" },
    });

    const formatted = taxes.map((t) => ({
      id: t.id,
      name: t.name,
      percentage: t.percentage.toNumber(),
      isActive: t.isActive,
    }));

    return NextResponse.json({ taxes: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const body = await req.json();
    const parsed = createTaxSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, percentage } = parsed.data;

    const tax = await prisma.tax.create({
      data: { name, percentage },
    });

    return NextResponse.json({ tax }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

