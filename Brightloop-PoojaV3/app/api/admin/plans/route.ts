import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { BillingPeriod } from "@prisma/client";

import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const createPlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  price: z.number().min(0, "Price must be >= 0"),
  billingPeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  minQuantity: z.number().int().min(1).default(1),
  availableFrom: z.string().optional().nullable(),
  availableTo: z.string().optional().nullable(),
  autoClose: z.boolean().default(false),
  closable: z.boolean().default(true),
  pausable: z.boolean().default(false),
  renewable: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);

    const plans = await prisma.plan.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
    });

    const formatted = plans.map((p) => ({
      ...p,
      price: p.price.toNumber(),
    }));

    return NextResponse.json({ plans: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const body = await req.json();
    const parsed = createPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      name,
      price,
      billingPeriod,
      minQuantity,
      availableFrom,
      availableTo,
      autoClose,
      closable,
      pausable,
      renewable,
    } = parsed.data;

    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        billingPeriod: billingPeriod as BillingPeriod,
        minQuantity,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        autoClose,
        closable,
        pausable,
        renewable,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

