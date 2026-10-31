"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type EntitlementRow = {
  id: number;
  productId: number;
  productName: string | null;
  productDescription: string | null;
  status: string;
  accessUrl: string | null;
  activatedAt: string | null;
  suspendedReason: string | null;
  expiresAt: string | null;
  canLaunch: boolean;
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-draft",
  ACTIVE: "badge-active",
  SUSPENDED: "badge-paused",
  EXPIRED: "badge-closed",
  REVOKED: "badge-closed",
};

function unusableReason(e: EntitlementRow): string | null {
  if (e.canLaunch) return null;
  if (e.status === "PENDING") return "Pending activation — this starts once your subscription is activated.";
  if (e.status === "SUSPENDED") return e.suspendedReason ?? "Access is currently suspended.";
  if (e.status === "EXPIRED") return "Access has expired.";
  if (e.status === "REVOKED") return "Access has been revoked.";
  if (e.status === "ACTIVE" && e.expiresAt) return `Access expired on ${formatDate(e.expiresAt)}.`;
  return null;
}

export function MySoftwareAccess() {
  const [entitlements, setEntitlements] = useState<EntitlementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/software-access")
      .then((r) => r.json())
      .then((d) => setEntitlements(d.entitlements ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>;
  }

  if (entitlements.length === 0) {
    return (
      <div className="panel" style={{ padding: 24 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          No software access yet. Access is granted automatically once a subscription becomes active.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {entitlements.map((e) => (
        <div key={e.id} className="panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>{e.productName ?? `Product #${e.productId}`}</p>
              {e.productDescription && <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 4 }}>{e.productDescription}</p>}
            </div>
            <span className={`badge ${STATUS_BADGE[e.status] ?? "badge-draft"}`}>[{e.status}]</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: "var(--text-sm)" }}>
            <div><p className="label">Activated</p><p className="font-mono">{e.activatedAt ? formatDate(e.activatedAt) : "—"}</p></div>
            <div><p className="label">Expires</p><p className="font-mono">{e.expiresAt ? formatDate(e.expiresAt) : "No expiry"}</p></div>
          </div>
          {e.canLaunch ? (
            <a href={e.accessUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: "fit-content" }}>
              Launch Software
            </a>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{unusableReason(e)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
