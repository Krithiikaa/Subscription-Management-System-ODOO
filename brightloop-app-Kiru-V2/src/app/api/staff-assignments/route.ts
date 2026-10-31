import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, staffProductAssignments, users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffAssignmentSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const staffId = url.searchParams.get("staffId");
  const productId = url.searchParams.get("productId");

  const filters = [];
  if (staffId && Number.isInteger(Number(staffId))) filters.push(eq(staffProductAssignments.staffId, Number(staffId)));
  if (productId && Number.isInteger(Number(productId))) filters.push(eq(staffProductAssignments.productId, Number(productId)));

  const rows = await db
    .select({
      id: staffProductAssignments.id,
      staffId: staffProductAssignments.staffId,
      staffName: users.name,
      staffEmail: users.email,
      productId: staffProductAssignments.productId,
      productName: products.name,
      assignedAt: staffProductAssignments.createdAt,
    })
    .from(staffProductAssignments)
    .innerJoin(users, eq(users.id, staffProductAssignments.staffId))
    .innerJoin(products, eq(products.id, staffProductAssignments.productId))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(staffProductAssignments.createdAt);

  return NextResponse.json({ assignments: rows });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = staffAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [staff] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, parsed.data.staffId)).limit(1);
  if (!staff || staff.role !== "STAFF") {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, parsed.data.productId)).limit(1);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: staffProductAssignments.id })
    .from(staffProductAssignments)
    .where(and(eq(staffProductAssignments.staffId, parsed.data.staffId), eq(staffProductAssignments.productId, parsed.data.productId)))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "This product is already assigned to this staff member" }, { status: 409 });
  }

  const [created] = await db
    .insert(staffProductAssignments)
    .values({ staffId: parsed.data.staffId, productId: parsed.data.productId, assignedBy: auth.session.userId })
    .returning();

  return NextResponse.json({ assignment: created }, { status: 201 });
}
