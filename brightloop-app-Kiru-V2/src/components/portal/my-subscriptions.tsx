"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { formatDate, formatMoney } from "@/lib/utils";

type SubscriptionRow = {
  id: number;
  number: string;
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

export function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ subscription: SubscriptionRow & Record<string, unknown>; lines: SubscriptionLineRow[] } | null>(null);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((d) => setSubscriptions(d.subscriptions ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id: number) {
    const res = await fetch(`/api/subscriptions/${id}`);
    const data = await res.json();
    setDetail(data);
  }

  if (loading) return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>;

  if (subscriptions.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>You have no subscriptions yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="panel" style={{ padding: 24 }}>
        <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
              <th style={{ padding: "8px 0" }}>Number</th>
              <th>Start date</th>
              <th>Next billing</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => openDetail(s.id)}>
                <td data-label="Number" className="font-mono" style={{ padding: "10px 0" }}>{s.number}</td>
                <td data-label="Start date" className="font-mono">{formatDate(s.startDate)}</td>
                <td data-label="Next billing" className="font-mono">{s.nextBillingDate ? formatDate(s.nextBillingDate) : "—"}</td>
                <td data-label="Status"><span className={`badge ${STATUS_BADGE[s.status] ?? "badge-draft"}`}>[{s.status}]</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? (detail.subscription.number as string) : ""}>
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className={`badge ${STATUS_BADGE[detail.subscription.status as string] ?? "badge-draft"}`} style={{ width: "fit-content" }}>
              [{detail.subscription.status as string}]
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              <div><p className="label">Start date</p><p className="font-mono">{formatDate(detail.subscription.startDate as string)}</p></div>
              <div><p className="label">Next billing</p><p className="font-mono">{detail.subscription.nextBillingDate ? formatDate(detail.subscription.nextBillingDate as string) : "—"}</p></div>
            </div>
            <div>
              <p className="label">Products</p>
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
          </div>
        )}
      </Drawer>
    </div>
  );
}
