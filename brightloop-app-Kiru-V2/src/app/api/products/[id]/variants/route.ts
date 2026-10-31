import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createVariantSchema } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  return NextResponse.json({ variants });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const [product] = await db.select({ id: products.id, status: products.status }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.status === "ARCHIVED") {
    return NextResponse.json({ error: "Cannot add a variant to an archived product" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createVariantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.code) {
    const [existing] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(and(eq(productVariants.productId, productId), eq(productVariants.code, parsed.data.code)))
      .limit(1);
    if (existing) {
      return NextResponse.json({ error: "A variant with this code already exists for this product" }, { status: 409 });
    }
  }

  const [created] = await db
    .insert(productVariants)
    .values({ ...parsed.data, productId })
    .returning();

  return NextResponse.json({ variant: created }, { status: 201 });
}
