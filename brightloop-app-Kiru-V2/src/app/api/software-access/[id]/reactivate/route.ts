import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { softwareEntitlements } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const entitlementId = Number(id);
  if (!Number.isInteger(entitlementId)) return NextResponse.json({ error: "Invalid entitlement id" }, { status: 400 });

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(softwareEntitlements)
      .set({ status: "ACTIVE", suspendedAt: null, suspendedReason: null, updatedAt: new Date() })
      .where(and(eq(softwareEntitlements.id, entitlementId), eq(softwareEntitlements.status, "SUSPENDED")))
      .returning();
    if (row) {
      await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "software_entitlement", entityId: entitlementId, oldValues: { status: "SUSPENDED" }, newValues: { status: "ACTIVE" } });
    }
    return row;
  });

  if (!updated) return NextResponse.json({ error: "Entitlement not found or not currently suspended" }, { status: 409 });
  return NextResponse.json({ entitlement: updated });
}
