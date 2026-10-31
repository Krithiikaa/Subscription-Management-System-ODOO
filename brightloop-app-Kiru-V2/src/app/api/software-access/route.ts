import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { softwareEntitlements, products } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { getStaffProductIds } from "@/lib/staff-access";
import { isEntitlementUsable } from "@/lib/entitlements";

export async function GET() {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  let rows;
  if (session.role === "CUSTOMER") {
    if (!session.customerId) return NextResponse.json({ entitlements: [] });
    rows = await db.select().from(softwareEntitlements).where(eq(softwareEntitlements.customerId, session.customerId));
  } else if (session.role === "STAFF") {
    const staffProductIds = await getStaffProductIds(db, session.userId);
    if (staffProductIds.length === 0) return NextResponse.json({ entitlements: [] });
    rows = await db.select().from(softwareEntitlements).where(inArray(softwareEntitlements.productId, staffProductIds));
  } else {
    rows = await db.select().from(softwareEntitlements);
  }

  const productIds = [...new Set(rows.map((r) => r.productId))];
  const productRows = productIds.length > 0 ? await db.select({ id: products.id, name: products.name, description: products.description }).from(products).where(inArray(products.id, productIds)) : [];
  const productMap = new Map(productRows.map((p) => [p.id, p]));

  const entitlements = rows.map((r) => ({
    ...r,
    productName: productMap.get(r.productId)?.name ?? null,
    productDescription: productMap.get(r.productId)?.description ?? null,
    canLaunch: isEntitlementUsable(r),
  }));

  return NextResponse.json({ entitlements });
}
