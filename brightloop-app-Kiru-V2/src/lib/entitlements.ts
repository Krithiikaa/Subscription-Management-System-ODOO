import { eq } from "drizzle-orm";
import type { Tx } from "@/db";
import { products, softwareEntitlements, subscriptionLines } from "@/db/schema";
import { logAudit } from "@/lib/audit";

type SubscriptionStatus = "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
type EntitlementRow = typeof softwareEntitlements.$inferSelect;

export function isEntitlementUsable(entitlement: Pick<EntitlementRow, "status" | "expiresAt">, now: Date = new Date()): boolean {
  if (entitlement.status !== "ACTIVE") return false;
  if (!entitlement.expiresAt) return true;
  return entitlement.expiresAt >= now.toISOString().slice(0, 10);
}

// Keeps software_entitlements in sync with a subscription's lifecycle.
// One entitlement row per subscription line, upserted on the line's unique
// index. DRAFT/QUOTATION/CONFIRMED are pre-activation — no entitlement is
// created until the subscription actually goes ACTIVE.
export async function syncEntitlementsForSubscription(
  tx: Tx,
  subscriptionId: number,
  customerId: number,
  newStatus: SubscriptionStatus
): Promise<void> {
  if (newStatus !== "ACTIVE" && newStatus !== "PAUSED" && newStatus !== "CLOSED") return;

  const lines = await tx
    .select({ id: subscriptionLines.id, productId: subscriptionLines.productId })
    .from(subscriptionLines)
    .where(eq(subscriptionLines.subscriptionId, subscriptionId));

  for (const line of lines) {
    const [existing] = await tx.select().from(softwareEntitlements).where(eq(softwareEntitlements.subscriptionLineId, line.id)).limit(1);

    if (newStatus === "ACTIVE") {
      const accessUrl = existing?.accessUrl ?? (await tx.select({ demoAccessUrl: products.demoAccessUrl }).from(products).where(eq(products.id, line.productId)).limit(1))[0]?.demoAccessUrl ?? null;
      const activatedAt = existing?.activatedAt ?? new Date();

      const [row] = existing
        ? await tx
            .update(softwareEntitlements)
            .set({ status: "ACTIVE", accessUrl, activatedAt, suspendedAt: null, suspendedReason: null, updatedAt: new Date() })
            .where(eq(softwareEntitlements.id, existing.id))
            .returning()
        : await tx
            .insert(softwareEntitlements)
            .values({ subscriptionLineId: line.id, customerId, productId: line.productId, status: "ACTIVE", accessUrl, activatedAt })
            .returning();

      await logAudit(tx, { userId: null, action: "STATUS_CHANGED", entityType: "software_entitlement", entityId: row.id, newValues: { status: "ACTIVE" } });
    } else if (newStatus === "PAUSED") {
      if (!existing) continue;
      const [row] = await tx
        .update(softwareEntitlements)
        .set({ status: "SUSPENDED", suspendedAt: new Date(), suspendedReason: "Subscription paused", updatedAt: new Date() })
        .where(eq(softwareEntitlements.id, existing.id))
        .returning();
      await logAudit(tx, { userId: null, action: "STATUS_CHANGED", entityType: "software_entitlement", entityId: row.id, newValues: { status: "SUSPENDED" } });
    } else if (newStatus === "CLOSED") {
      if (!existing) continue;
      const [row] = await tx
        .update(softwareEntitlements)
        .set({ status: "REVOKED", revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(softwareEntitlements.id, existing.id))
        .returning();
      await logAudit(tx, { userId: null, action: "STATUS_CHANGED", entityType: "software_entitlement", entityId: row.id, newValues: { status: "REVOKED" } });
    }
  }
}
