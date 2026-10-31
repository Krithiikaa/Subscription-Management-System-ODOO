import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, productCategories, productVariants, products, staffProductAssignments, users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateProductSchema } from "@/lib/validation";

async function loadProductDetail(productId: number) {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return null;

  const [variants, productPlans, assignedStaff] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, productId)),
    db.select().from(plans).where(eq(plans.productId, productId)),
    db
      .select({ id: users.id, name: users.name, email: users.email, assignedAt: staffProductAssignments.createdAt })
      .from(staffProductAssignments)
      .innerJoin(users, eq(users.id, staffProductAssignments.staffId))
      .where(eq(staffProductAssignments.productId, productId)),
  ]);

  return { product, variants, plans: productPlans, assignedStaff };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  if (session.role === "STAFF") {
    const [assignment] = await db
      .select({ id: staffProductAssignments.id })
      .from(staffProductAssignments)
      .where(and(eq(staffProductAssignments.staffId, session.userId), eq(staffProductAssignments.productId, productId)))
      .limit(1);
    if (!assignment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const detail = await loadProductDetail(productId);
  if (!detail) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (session.role === "STAFF") {
    const productWithoutCost: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(detail.product)) {
      if (key !== "costPrice") productWithoutCost[key] = value;
    }
    return NextResponse.json({ product: productWithoutCost, variants: detail.variants, plans: detail.plans });
  }

  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.sku) {
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.sku, parsed.data.sku)).limit(1);
    if (existing && existing.id !== productId) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
    }
  }

  if (parsed.data.category) {
    const [category] = await db.select({ active: productCategories.active }).from(productCategories).where(eq(productCategories.name, parsed.data.category)).limit(1);
    if (!category) {
      return NextResponse.json({ error: "Unknown category" }, { status: 400 });
    }
    if (!category.active) {
      return NextResponse.json({ error: "Cannot move a product into an inactive category" }, { status: 409 });
    }
  }

  const [updated] = await db
    .update(products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product: updated });
}
