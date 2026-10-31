import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { discounts, products } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createDiscountSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const rows = await db.select().from(discounts).orderBy(discounts.createdAt);
  return NextResponse.json({ discounts: rows });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createDiscountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.code) {
    const [existing] = await db.select({ id: discounts.id }).from(discounts).where(eq(discounts.code, parsed.data.code)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "A discount with this code already exists" }, { status: 409 });
    }
  }

  if (parsed.data.productId) {
    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, parsed.data.productId)).limit(1);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  }

  const [created] = await db.insert(discounts).values(parsed.data).returning();
  return NextResponse.json({ discount: created }, { status: 201 });
}
