"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { formatDate, formatMoney } from "@/lib/utils";
import { SUBSCRIPTION_STATUSES } from "@/lib/validation";

type CustomerOption = { id: number; name: string; email: string; companyName: string | null };

type SubscriptionRow = {
  id: number;
  number: string;
  customerId: number;
  status: string;
  startDate: string;
  expiryDate: string | null;
  nextBillingDate: string | null;
};

type SubscriptionLineRow = {
  id: number;
  productName: string | null;
  variantName: string | null;
  planName: string | null;
  billingPeriod: string | null;
  quantity: number;
  unitPrice: string;
  amount: string;
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-draft",
  QUOTATION: "badge-warning",
  CONFIRMED: "badge-confirmed",
  ACTIVE: "badge-active",
  PAUSED: "badge-paused",
  CLOSED: "badge-closed",
};

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState<{ subscription: SubscriptionRow & Record<string, unknown>; lines: SubscriptionLineRow[] } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/subscriptions?${params.toString()}`);
    const data = await res.json();
    setSubscriptions(data.subscriptions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, []);

  function customerLabel(id: number) {
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}${c.companyName ? ` (${c.companyName})` : ""}` : `#${id}`;
  }

  async function openDetail(id: number) {
    setActionError(null);
    setReason("");
    const res = await fetch(`/api/subscriptions/${id}`);
    const data = await res.json();
    setDetail(data);
  }

  async function runAction(path: string, body?: Record<string, unknown>) {
    setActionError(null);
    const res = await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error ?? "Something went wrong");
      return;
    }
    if (detail) await openDetail(detail.subscription.id as number);
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <select className="input" style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {SUBSCRIPTION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : subscriptions.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No subscriptions yet. Subscriptions are created from an accepted quotation, or directly by an admin.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Number</th>
                <th>Customer</th>
                <th>Start date</th>
                <th>Next billing</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => openDetail(s.id)}>
                  <td data-label="Number" className="font-mono" style={{ padding: "10px 0" }}>{s.number}</td>
                  <td data-label="Customer">{customerLabel(s.customerId)}</td>
                  <td data-label="Start date" className="font-mono">{formatDate(s.startDate)}</td>
                  <td data-label="Next billing" className="font-mono">{s.nextBillingDate ? formatDate(s.nextBillingDate) : "—"}</td>
                  <td data-label="Status">
                    <span className={`badge ${STATUS_BADGE[s.status] ?? "badge-draft"}`}>[{s.status}]</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? (detail.subscription.number as string) : ""}>
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {actionError && <div className="badge badge-overdue" style={{ width: "100%" }}>{actionError}</div>}
            <span className={`badge ${STATUS_BADGE[detail.subscription.status as string] ?? "badge-draft"}`} style={{ width: "fit-content" }}>
              [{detail.subscription.status as string}]
            </span>
            <div>
              <p className="label">Customer</p>
              <p>{customerLabel(detail.subscription.customerId as number)}</p>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <p className="label">Start date</p>
                <p className="font-mono">{formatDate(detail.subscription.startDate as string)}</p>
              </div>
              <div>
                <p className="label">Next billing</p>
                <p className="font-mono">{detail.subscription.nextBillingDate ? formatDate(detail.subscription.nextBillingDate as string) : "—"}</p>
              </div>
            </div>
            <div>
              <p className="label">Lines</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {detail.lines.map((l) => (
                  <div key={l.id} className="panel" style={{ padding: 10, fontSize: "var(--text-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                      <span>{l.productName}{l.variantName ? ` — ${l.variantName}` : ""}</span>
                      <span className="font-mono">{formatMoney(l.amount)}</span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                      {l.planName} ({l.billingPeriod}) · Qty {l.quantity} · Unit {formatMoney(l.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Reason (optional, for pause/close)</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {detail.subscription.status === "QUOTATION" && (
                <button className="btn-primary" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/sign-off`)}>Sign off &amp; activate</button>
              )}
              {(detail.subscription.status === "DRAFT" || detail.subscription.status === "QUOTATION") && (
                <button className="btn-primary" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/confirm`)}>Confirm</button>
              )}
              {detail.subscription.status === "CONFIRMED" && (
                <button className="btn-primary" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/activate`)}>Activate</button>
              )}
              {detail.subscription.status === "ACTIVE" && (
                <>
                  <button className="btn-ghost" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/pause`, { reason: reason || undefined })}>Pause</button>
                  <button className="btn-ghost" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/renew`)}>Renew</button>
                </>
              )}
              {detail.subscription.status === "PAUSED" && (
                <button className="btn-primary" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/resume`)}>Resume</button>
              )}
              {["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED"].includes(detail.subscription.status as string) && (
                <button className="btn-danger" onClick={() => runAction(`/api/subscriptions/${detail.subscription.id}/close`, { reason: reason || undefined })}>
                  {["ACTIVE", "PAUSED"].includes(detail.subscription.status as string) ? "Close (early closure)" : "Cancel"}
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
