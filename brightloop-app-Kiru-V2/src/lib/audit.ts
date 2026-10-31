import { auditLogs } from "@/db/schema";
import type { Tx } from "@/db";

type AuditAction = "CREATED" | "UPDATED" | "STATUS_CHANGED" | "DELETED";

export async function logAudit(
  tx: Tx,
  params: {
    userId: number | null;
    action: AuditAction;
    entityType: string;
    entityId: number;
    oldValues?: Record<string, unknown> | null;
    newValues?: Record<string, unknown> | null;
  }
) {
  await tx.insert(auditLogs).values({
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
    newValues: params.newValues ? JSON.stringify(params.newValues) : null,
  });
}
