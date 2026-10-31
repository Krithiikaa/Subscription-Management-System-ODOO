"use client";

import { useEffect, useState } from "react";
import { formatMoney, formatDate } from "@/lib/utils";

type CustomerStats = {
  activeSubscriptions: number;
  pendingQuotations: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalPaymentsMade: string;
  upcomingRenewals: { subscriptionNumber: string; nextBillingDate: string }[];
  softwareAccessSummary: { active: number; total: number };
};

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="panel" style={{ padding: 16, minWidth: 150 }}>
      <p className="label" style={{ margin: 0 }}>{label}</p>
      <p className="font-mono" style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginTop: 6 }}>{value}</p>
    </div>
  );
}

export function PortalStats() {
  const [stats, setStats] = useState<CustomerStats | null>(null);

  useEffect(() => {
    fetch("/api/reports/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) return null;

  return (
    <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Tile label="Active subscriptions" value={stats.activeSubscriptions} />
        <Tile label="Pending quotations" value={stats.pendingQuotations} />
        <Tile label="Outstanding invoices" value={stats.outstandingInvoices} />
        <Tile label="Overdue invoices" value={stats.overdueInvoices} />
        <Tile label="Total paid" value={formatMoney(stats.totalPaymentsMade)} />
        <Tile label="Software access" value={`${stats.softwareAccessSummary.active}/${stats.softwareAccessSummary.total} active`} />
      </div>
      {stats.upcomingRenewals.length > 0 && (
        <div className="panel" style={{ padding: 16 }}>
          <p className="label" style={{ margin: 0 }}>Upcoming renewals (next 30 days)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {stats.upcomingRenewals.map((r) => (
              <div key={r.subscriptionNumber} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="font-mono">{r.subscriptionNumber}</span>
                <span className="font-mono" style={{ color: "var(--text-muted)" }}>{formatDate(r.nextBillingDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
