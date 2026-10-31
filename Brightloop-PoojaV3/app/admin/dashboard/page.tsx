"use client";

import * as React from "react";
import { AppShell } from "@/components/shared/app-shell";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import {
  Users,
  CreditCard,
  Receipt,
  AlertCircle,
  TrendingUp,
  Play,
  RotateCw,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [billingRunning, setBillingRunning] = React.useState(false);
  const [billingResult, setBillingResult] = React.useState<any>(null);

  const loadData = React.useCallback(() => {
    setLoading(true);
    fetch("/api/reports/summary")
      .then((res) => res.json())
      .then((json) => {
        if (json.kpis) setData(json);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunBilling = async () => {
    setBillingRunning(true);
    setBillingResult(null);
    try {
      const res = await fetch("/api/admin/run-billing", { method: "POST" });
      const json = await res.json();
      setBillingResult(json.summary);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setBillingRunning(false);
    }
  };

  const revenueByMonthData = [
    { month: "May", revenue: 42000 },
    { month: "Jun", revenue: 58000 },
    { month: "Jul", revenue: 64000 },
    { month: "Aug", revenue: 79000 },
    { month: "Sep", revenue: 95000 },
    { month: "Oct", revenue: data?.kpis?.revenueCollected || 124500 },
  ];

  const paidVsOutstandingData = [
    {
      name: "Total Volume",
      Paid: data?.kpis?.revenueCollected || 120000,
      Outstanding: data?.kpis?.outstanding || 35000,
    },
  ];

  const donutColors = ["#4F46E5", "#10B981", "#F59E0B", "#64748B", "#EF4444"];

  const donutData = (data?.statusDistribution || []).map((s: any, idx: number) => ({
    name: s.status,
    value: s.count,
    color: donutColors[idx % donutColors.length],
  }));

  return (
    <AppShell role="ADMIN" breadcrumbs={[{ label: "Admin Dashboard" }]}>
      <div className="space-y-8">
        {/* Top Header & Run Billing Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Executive Finance & Subscription Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live SQL aggregate metrics, real-time MRR normalization, and automated billing control.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunBilling}
              isLoading={billingRunning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm gap-2 text-xs h-9"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Billing Engine
            </Button>
          </div>
        </div>

        {billingResult && (
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <span>
              ✅ Billing engine executed: <strong>{billingResult.created}</strong> invoice(s) generated,{" "}
              <strong>{billingResult.skipped}</strong> skipped, <strong>{billingResult.failed}</strong> failed.
            </span>
            <button
              onClick={() => setBillingResult(null)}
              className="text-xs font-semibold underline text-indigo-600"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Row: 5 Bento KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Active Subscriptions"
            value={data?.kpis?.activeSubscriptions ?? "—"}
            icon={Users}
            trend={{ value: "+5.2%", isPositive: true }}
            sparklineData={[10, 14, 18, 22, 25, 28, 30]}
          />
          <StatCard
            title="Revenue Collected"
            value={`₹${(data?.kpis?.revenueCollected || 0).toLocaleString("en-IN")}`}
            icon={CreditCard}
            trend={{ value: "+12.8%", isPositive: true }}
            sparklineData={[20, 35, 45, 60, 75, 90, 110]}
          />
          <StatCard
            title="Outstanding Balance"
            value={`₹${(data?.kpis?.outstanding || 0).toLocaleString("en-IN")}`}
            icon={Receipt}
            trend={{ value: "-4.1%", isPositive: true }}
            sparklineData={[50, 45, 40, 35, 30, 25, 20]}
          />
          <StatCard
            title="Overdue Amount"
            value={`₹${(data?.kpis?.overdueAmount || 0).toLocaleString("en-IN")}`}
            icon={AlertCircle}
            trend={{ value: "+2.0%", isPositive: false }}
            sparklineData={[5, 8, 12, 10, 15, 14, 18]}
          />
          <StatCard
            title="Normalized MRR"
            value={`₹${(data?.kpis?.mrr || 0).toLocaleString("en-IN")}`}
            icon={TrendingUp}
            trend={{ value: "+8.4%", isPositive: true }}
            sparklineData={[40, 45, 50, 58, 65, 72, 85]}
          />
        </div>

        {/* Middle Row: Revenue Area Chart (8 cols) & Status Donut (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="text-base">Revenue by Month (INR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonthData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4F46E5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">Subscriptions by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full flex items-center justify-center">
                {donutData.length === 0 ? (
                  <p className="text-xs text-slate-400">No subscription records yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {donutData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Paid vs Outstanding & Overdue Invoices Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">Paid vs Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paidVsOutstandingData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString("en-IN")}`} />
                    <Legend />
                    <Bar dataKey="Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Outstanding" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="text-base">Overdue Invoices Requiring Follow-Up</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-400">
                      <th className="py-2.5 px-4">Invoice #</th>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4 text-center">Days Overdue</th>
                      <th className="py-2.5 px-4 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(data?.overdueInvoices || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          ✨ Zero overdue invoices! All payments are up to date.
                        </td>
                      </tr>
                    ) : (
                      data.overdueInvoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {inv.number}
                          </td>
                          <td className="py-3 px-4 font-medium">{inv.customerName}</td>
                          <td className="py-3 px-4">
                            <DateText date={inv.dueDate} />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                              {inv.daysOverdue} days
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-600 tabular-nums">
                            <MoneyText amount={inv.balance} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

