"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/utils";

type Stats = {
  totalCustomers: number;
  totalProducts: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  renewedSubscriptions: number;
  cancelledSubscriptions: number;
  totalInvoices: number;
  paidInvoices: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalRevenueCollected: string;
  outstandingRevenue: string;
  mrr: string;
  arr: string;
  series: {
    revenueTrend: { date: string; amount: string }[];
    subscriptionGrowth: { date: string; count: number }[];
    productWiseSubscriptions: { productName: string; count: number }[];
    invoiceStatusDistribution: { status: string; count: number }[];
    paymentStatusDistribution: { status: string; count: number }[];
  };
};

const PIE_COLORS = ["var(--accent)", "var(--success)", "var(--warning)", "var(--danger)", "var(--text-muted)"];

type Preset = "today" | "7d" | "30d" | "thisMonth" | "prevMonth" | "thisYear" | "custom" | "all";

function presetRange(preset: Preset): { from: string; to: string } | null {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = iso(now);
  switch (preset) {
    case "all":
      return null;
    case "today":
      return { from: today, to: today };
    case "7d": {
      const from = new Date(now.getTime() - 6 * 86_400_000);
      return { from: iso(from), to: today };
    }
    case "30d": {
      const from = new Date(now.getTime() - 29 * 86_400_000);
      return { from: iso(from), to: today };
    }
    case "thisMonth": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: iso(from), to: today };
    }
    case "prevMonth": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: iso(from), to: iso(to) };
    }
    case "thisYear": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: iso(from), to: today };
    }
    default:
      return null;
  }
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel" style={{ padding: 16, minWidth: 160, flex: "1 1 160px" }}>
      <p className="label" style={{ margin: 0 }}>{label}</p>
      <p className="font-mono" style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginTop: 6 }}>{value}</p>
    </div>
  );
}

export function FinanceDashboard({ role }: { role: "ADMIN" | "STAFF" }) {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    if (preset === "custom") {
      if (!customFrom || !customTo) return null;
      return { from: customFrom, to: customTo };
    }
    return presetRange(preset);
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (range) {
      params.set("from", range.from);
      params.set("to", range.to);
    }
    fetch(`/api/reports/dashboard?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {([
          ["today", "Today"],
          ["7d", "Last 7 days"],
          ["30d", "Last 30 days"],
          ["thisMonth", "This month"],
          ["prevMonth", "Previous month"],
          ["thisYear", "This year"],
          ["all", "All time"],
        ] as [Preset, string][]).map(([key, label]) => (
          <button
            key={key}
            className={preset === key ? "btn-primary" : "btn-ghost"}
            style={{ fontSize: "var(--text-xs)", padding: "6px 10px" }}
            onClick={() => setPreset(key)}
          >
            {label}
          </button>
        ))}
        <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "var(--text-xs)" }}>
          <input type="date" className="input" style={{ padding: "4px 8px" }} value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setPreset("custom"); }} />
          <span style={{ color: "var(--text-muted)" }}>to</span>
          <input type="date" className="input" style={{ padding: "4px 8px" }} value={customTo} onChange={(e) => { setCustomTo(e.target.value); setPreset("custom"); }} />
        </span>
      </div>

      {loading || !stats ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {role === "ADMIN" && <StatTile label="Total Customers" value={String(stats.totalCustomers)} />}
            <StatTile label="Active Subscriptions" value={String(stats.activeSubscriptions)} />
            <StatTile label="Revenue Collected" value={formatMoney(stats.totalRevenueCollected)} />
            <StatTile label="Outstanding Revenue" value={formatMoney(stats.outstandingRevenue)} />
            <StatTile label="MRR" value={formatMoney(stats.mrr)} />
            <StatTile label="ARR" value={formatMoney(stats.arr)} />
            <StatTile label="Overdue Invoices" value={String(stats.overdueInvoices)} />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div className="panel" style={{ padding: 16, flex: "1 1 420px", minHeight: 280 }}>
              <p className="label">Revenue trend</p>
              {stats.series.revenueTrend.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No payments recorded in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.series.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatMoney(String(v ?? 0))} />
                    <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="panel" style={{ padding: 16, flex: "1 1 420px", minHeight: 280 }}>
              <p className="label">Subscription growth</p>
              {stats.series.subscriptionGrowth.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No new subscriptions in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.series.subscriptionGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="panel" style={{ padding: 16, flex: "1 1 320px", minHeight: 280 }}>
              <p className="label">Invoice status distribution</p>
              {stats.series.invoiceStatusDistribution.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No invoices yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.series.invoiceStatusDistribution} dataKey="count" nameKey="status" outerRadius={80} label>
                      {stats.series.invoiceStatusDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="panel" style={{ padding: 16, flex: "1 1 320px", minHeight: 280 }}>
              <p className="label">Product-wise subscriptions</p>
              {stats.series.productWiseSubscriptions.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No active subscriptions yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.series.productWiseSubscriptions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
