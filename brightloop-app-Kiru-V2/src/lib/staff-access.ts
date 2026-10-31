import { eq } from "drizzle-orm";
import type { Db, Tx } from "@/db";
import { staffProductAssignments } from "@/db/schema";

// A staff member may only manage quotations/subscriptions whose lines are
// ENTIRELY within their assigned products — a multi-product document with
// even one unauthorized line is rejected outright (no silent line-dropping).
export async function staffCanAccessAllProducts(tx: Db | Tx, staffId: number, productIds: number[]): Promise<boolean> {
  if (productIds.length === 0) return true;
  const uniqueIds = [...new Set(productIds)];
  const rows = await tx
    .select({ productId: staffProductAssignments.productId })
    .from(staffProductAssignments)
    .where(eq(staffProductAssignments.staffId, staffId));
  const assigned = new Set(rows.map((r) => r.productId));
  return uniqueIds.every((id) => assigned.has(id));
}

export async function getStaffProductIds(tx: Db | Tx, staffId: number): Promise<number[]> {
  const rows = await tx.select({ productId: staffProductAssignments.productId }).from(staffProductAssignments).where(eq(staffProductAssignments.staffId, staffId));
  return rows.map((r) => r.productId);
}
