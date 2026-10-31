import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db, Tx } from "@/db";
import { staffProductAssignments, users } from "@/db/schema";

export type AssignedStaff = { id: number; name: string; email: string };

// The real staff member responsible for each product: the earliest active
// STAFF user assigned to it via staff_product_assignments (the same table that
// decides who may act on the product). Products with no one assigned are
// absent from the map.
export async function getAssignedStaffByProduct(tx: Db | Tx, productIds: number[]): Promise<Map<number, AssignedStaff>> {
  const ids = [...new Set(productIds)];
  const result = new Map<number, AssignedStaff>();
  if (ids.length === 0) return result;

  const rows = await tx
    .select({ productId: staffProductAssignments.productId, id: users.id, name: users.name, email: users.email })
    .from(staffProductAssignments)
    .innerJoin(users, eq(users.id, staffProductAssignments.staffId))
    .where(and(inArray(staffProductAssignments.productId, ids), eq(users.role, "STAFF"), eq(users.active, true)))
    .orderBy(asc(staffProductAssignments.id));

  for (const r of rows) {
    if (!result.has(r.productId)) result.set(r.productId, { id: r.id, name: r.name, email: r.email });
  }
  return result;
}
