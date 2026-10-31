import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { productCategories } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createCategorySchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const rows = await db.select().from(productCategories).orderBy(productCategories.name);
  return NextResponse.json({ categories: rows });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: productCategories.id })
    .from(productCategories)
    .where(eq(sql`lower(${productCategories.name})`, parsed.data.name.toLowerCase()))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
  }

  const [created] = await db.insert(productCategories).values(parsed.data).returning();
  return NextResponse.json({ category: created }, { status: 201 });
}
