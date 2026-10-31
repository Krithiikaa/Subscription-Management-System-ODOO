import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { productCategories, taxRules } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateTaxRuleSchema } from "@/lib/validation";
import { findConflictingTaxRule } from "@/lib/tax-overlap";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const taxRuleId = Number(id);
  if (!Number.isInteger(taxRuleId)) {
    return NextResponse.json({ error: "Invalid tax rule id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateTaxRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(taxRules).where(eq(taxRules.id, taxRuleId)).limit(1);
      if (!existing) throw new ApiError(404, "Tax rule not found");

      if (parsed.data.code) {
        const [duplicate] = await tx
          .select({ id: taxRules.id })
          .from(taxRules)
          .where(and(eq(taxRules.code, parsed.data.code), ne(taxRules.id, taxRuleId)))
          .limit(1);
        if (duplicate) throw new ApiError(409, "A tax rule with this code already exists");
      }

      if (parsed.data.category) {
        const [category] = await tx.select({ active: productCategories.active }).from(productCategories).where(eq(productCategories.name, parsed.data.category)).limit(1);
        if (!category) throw new ApiError(400, "Unknown category");
      }

      const merged = {
        name: parsed.data.name ?? existing.name,
        productId: parsed.data.productId !== undefined ? parsed.data.productId : existing.productId,
        category: parsed.data.category !== undefined ? parsed.data.category : existing.category,
        effectiveFrom: parsed.data.effectiveFrom !== undefined ? parsed.data.effectiveFrom : existing.effectiveFrom,
        effectiveTo: parsed.data.effectiveTo !== undefined ? parsed.data.effectiveTo : existing.effectiveTo,
        active: parsed.data.active ?? existing.active,
      };

      if (merged.active) {
        const existingActive = await tx.select().from(taxRules).where(eq(taxRules.active, true));
        const conflict = findConflictingTaxRule({ id: taxRuleId, ...merged }, existingActive);
        if (conflict) {
          throw new ApiError(409, `This rule conflicts with an existing active tax rule with the same name and scope ("${conflict.name}", id ${conflict.id}) over an overlapping effective period`);
        }
      }

      const [row] = await tx
        .update(taxRules)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(taxRules.id, taxRuleId))
        .returning();
      return row;
    });

    return NextResponse.json({ taxRule: updated });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
