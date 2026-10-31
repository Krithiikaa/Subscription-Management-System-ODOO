import { NextResponse } from "next/server";
import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { db } from "@/db";
import { productCategories, products, staffProductAssignments } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createProductSchema, PRODUCT_STATUSES } from "@/lib/validation";

const PAGE_SIZE_DEFAULT = 20;

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");
  const sort = url.searchParams.get("sort") === "price" ? "price" : "createdAt";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT));

  const filters = [];
  if (search) filters.push(ilike(products.name, `%${search}%`));
  if (category) {
    filters.push(eq(products.category, category));
  }
  if (status && (PRODUCT_STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(products.status, status as (typeof PRODUCT_STATUSES)[number]));
  }

  // Staff only see products assigned to them.
  if (session.role === "STAFF") {
    const assigned = await db
      .select({ productId: staffProductAssignments.productId })
      .from(staffProductAssignments)
      .where(eq(staffProductAssignments.staffId, session.userId));
    const assignedIds = assigned.map((a) => a.productId);
    if (assignedIds.length === 0) {
      return NextResponse.json({ products: [], total: 0, page, pageSize });
    }
    filters.push(inArray(products.id, assignedIds));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;
  const orderColumn = sort === "price" ? products.salesPrice : products.createdAt;
  const orderFn = order === "asc" ? asc : desc;

  const columns =
    session.role === "ADMIN"
      ? undefined
      : {
          id: products.id,
          name: products.name,
          sku: products.sku,
          category: products.category,
          type: products.type,
          description: products.description,
          salesPrice: products.salesPrice,
          currency: products.currency,
          status: products.status,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        };

  const [rows, [{ total }]] = await Promise.all([
    columns
      ? db.select(columns).from(products).where(whereClause).orderBy(orderFn(orderColumn)).limit(pageSize).offset((page - 1) * pageSize)
      : db.select().from(products).where(whereClause).orderBy(orderFn(orderColumn)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(products).where(whereClause),
  ]);

  return NextResponse.json({ products: rows, total, page, pageSize });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.sku) {
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.sku, parsed.data.sku)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
    }
  }

  const [category] = await db.select({ active: productCategories.active }).from(productCategories).where(eq(productCategories.name, parsed.data.category)).limit(1);
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }
  if (!category.active) {
    return NextResponse.json({ error: "Cannot create a product in an inactive category" }, { status: 409 });
  }

  const [created] = await db.insert(products).values(parsed.data).returning();
  return NextResponse.json({ product: created }, { status: 201 });
}
