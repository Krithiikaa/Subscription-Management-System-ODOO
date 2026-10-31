import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { productCategories } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateCategorySchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.name) {
    const [duplicate] = await db
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(and(eq(sql`lower(${productCategories.name})`, parsed.data.name.toLowerCase()), ne(productCategories.id, categoryId)))
      .limit(1);
    if (duplicate) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }
  }

  // Renaming cascades to products/tax_rules via ON UPDATE CASCADE — existing
  // records stay valid and automatically point at the new name.
  const [updated] = await db
    .update(productCategories)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(productCategories.id, categoryId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ category: updated });
}
