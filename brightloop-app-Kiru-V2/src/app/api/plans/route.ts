import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, products } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { BILLING_PERIODS, createPlanSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const billingPeriod = url.searchParams.get("billingPeriod");
  const active = url.searchParams.get("active");

  const filters = [];
  if (productId && Number.isInteger(Number(productId))) {
    filters.push(eq(plans.productId, Number(productId)));
  }
  if (billingPeriod && (BILLING_PERIODS as readonly string[]).includes(billingPeriod)) {
    filters.push(eq(plans.billingPeriod, billingPeriod as (typeof BILLING_PERIODS)[number]));
  }
  if (active === "true" || active === "false") {
    filters.push(eq(plans.active, active === "true"));
  }

  const rows = await db
    .select()
    .from(plans)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(plans.createdAt);

  return NextResponse.json({ plans: rows });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [product] = await db.select({ id: products.id, status: products.status }).from(products).where(eq(products.id, parsed.data.productId)).limit(1);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Cannot create a plan for an inactive or archived product" }, { status: 409 });
  }

  const [created] = await db.insert(plans).values(parsed.data).returning();
  return NextResponse.json({ plan: created }, { status: 201 });
}
