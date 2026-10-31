"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type CustomerOption = { id: number; name: string; email: string; companyName: string | null };
type EntitlementRow = {
  id: number;
  customerId: number;
  productId: number;
  productName: string | null;
  status: string;
  activatedAt: string | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  expiresAt: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-draft",
  ACTIVE: "badge-active",
  SUSPENDED: "badge-paused",
  EXPIRED: "badge-closed",
  REVOKED: "badge-closed",
};

export function SoftwareAccessManager() {
  const [entitlements, setEntitlements] = useState<EntitlementRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/software-access");
    const data = await res.json();
    setEntitlements(data.entitlements ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, []);

  function customerLabel(id: number) {
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}${c.companyName ? ` (${c.companyName})` : ""}` : `#${id}`;
  }

  async function runAction(id: number, action: "suspend" | "reactivate") {
    setActionError(null);
    const res = await fetch(`/api/software-access/${id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error ?? "Something went wrong");
      return;
    }
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {actionError && <div className="badge badge-overdue" style={{ width: "100%" }}>{actionError}</div>}
      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : entitlements.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No software access entitlements yet. These are created automatically when a subscription becomes active.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Customer</th><th>Product</th><th>Activated</th><th>Expires</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.map((e) => (
                <tr key={e.id} className="ledger-row">
                  <td data-label="Customer" style={{ padding: "10px 0" }}>{customerLabel(e.customerId)}</td>
                  <td data-label="Product">{e.productName ?? `#${e.productId}`}</td>
                  <td data-label="Activated" className="font-mono">{e.activatedAt ? formatDate(e.activatedAt) : "—"}</td>
                  <td data-label="Expires" className="font-mono">{e.expiresAt ? formatDate(e.expiresAt) : "—"}</td>
                  <td data-label="Status">
                    <span className={`badge ${STATUS_BADGE[e.status] ?? "badge-draft"}`}>[{e.status}]</span>
                    {e.status === "SUSPENDED" && e.suspendedReason && (
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>{e.suspendedReason}</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    {e.status === "ACTIVE" && (
                      <button className="btn-ghost" onClick={() => runAction(e.id, "suspend")}>Suspend</button>
                    )}
                    {e.status === "SUSPENDED" && (
                      <button className="btn-primary" onClick={() => runAction(e.id, "reactivate")}>Reactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
