import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, staffProductAssignments } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiRole("STAFF");
  if ("response" in auth) return auth.response;

  const rows = await db
    .select({
      id: staffProductAssignments.id,
      productId: staffProductAssignments.productId,
      productName: products.name,
      productCategory: products.category,
      productStatus: products.status,
      assignedAt: staffProductAssignments.createdAt,
    })
    .from(staffProductAssignments)
    .innerJoin(products, eq(products.id, staffProductAssignments.productId))
    .where(eq(staffProductAssignments.staffId, auth.session.userId));

  return NextResponse.json({ assignments: rows });
}
