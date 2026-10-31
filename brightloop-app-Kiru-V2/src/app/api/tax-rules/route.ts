import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productCategories, taxRules } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createTaxRuleSchema } from "@/lib/validation";
import { findConflictingTaxRule } from "@/lib/tax-overlap";

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const rows = await db.select().from(taxRules).orderBy(taxRules.createdAt);
  return NextResponse.json({ taxRules: rows });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createTaxRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const created = await db.transaction(async (tx) => {
      if (parsed.data.code) {
        const [existing] = await tx.select({ id: taxRules.id }).from(taxRules).where(eq(taxRules.code, parsed.data.code)).limit(1);
        if (existing) throw new ApiError(409, "A tax rule with this code already exists");
      }

      if (parsed.data.category) {
        const [category] = await tx.select({ active: productCategories.active }).from(productCategories).where(eq(productCategories.name, parsed.data.category)).limit(1);
        if (!category) throw new ApiError(400, "Unknown category");
      }

      // New tax rules are always created active (no `active` field in the create schema).
      const existingActive = await tx.select().from(taxRules).where(eq(taxRules.active, true));
      const conflict = findConflictingTaxRule(
        { name: parsed.data.name, productId: parsed.data.productId ?? null, category: parsed.data.category ?? null, effectiveFrom: parsed.data.effectiveFrom ?? null, effectiveTo: parsed.data.effectiveTo ?? null, active: true },
        existingActive
      );
      if (conflict) {
        throw new ApiError(409, `This rule conflicts with an existing active tax rule with the same name and scope ("${conflict.name}", id ${conflict.id}) over an overlapping effective period`);
      }

      const [row] = await tx.insert(taxRules).values(parsed.data).returning();
      return row;
    });
    return NextResponse.json({ taxRule: created }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
