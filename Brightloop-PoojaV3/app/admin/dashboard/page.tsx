"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import {
  Users,
  CreditCard,
  Receipt,
  Play,
  RotateCw,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  Percent,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

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
      toast.success(json.message || "Billing engine ran successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute billing engine");
    } finally {
      setBillingRunning(false);
    }
  };

  return (
    <AppShell role="ADMIN" breadcrumbs={[{ label: "Admin Dashboard" }]}>
      <div className="space-y-6 sm:space-y-8 font-sans">
        {/* Top Hero Welcoming Header (Crextio/Nixtio style) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900 dark:text-white">
              Welcome in, <span className="font-semibold">BrightLoop</span>
            </h1>

            {/* Lifecycle Segmented Pill Progress Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Quotations</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#181D24] text-white text-[10px] font-bold">15%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Confirmed</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">20%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Active</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">60%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Overdue</span>
                <span className="px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">5%</span>
              </div>
            </div>
          </div>

          {/* Top Right: 3 Big Geometric Number Counters (Crextio style) */}
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {data?.kpis?.activeSubscriptions ?? 78}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Active Subs
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                  56
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Invoices
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                  ₹{(Math.round((data?.kpis?.revenueCollected || 124500) / 1000))}k
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Revenue
              </span>
            </div>
          </div>
        </div>

        {/* 4 Bento Widget Columns (Exact Crextio layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Column 1: User Spotlight Profile Card (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio">
            <div className="space-y-4">
              {/* Photo Avatar Card with badge */}
              <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                <div className="self-end px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-bold shadow-sm">
                  ₹2,560/mo
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Pooja Admin
                  </h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    Executive & Finance
                  </p>
                </div>
              </div>

              {/* Accordion Links */}
              <div className="space-y-1.5 pt-2 text-xs">
                <Link
                  href="/admin/plans"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span className="font-medium">Subscription Plans</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/admin/invoices"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span className="font-medium">Billing Engine Cycle</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/admin/taxes"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span className="font-medium">Tax & GST Summary</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/admin/discounts"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span className="font-medium">Discount Rules</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Column 2: Progress Widget with Vertical Bar Indicators (3 cols) */}
          <div className="lg:col-span-3 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Progress</span>
                <Link
                  href="/admin/invoices"
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-slate-900 dark:text-white">
                    ₹{(Math.round((data?.kpis?.revenueCollected || 124500) / 1000))}k
                  </span>
                  <span className="text-[11px] text-slate-400">Total volume</span>
                </div>
              </div>
            </div>

            {/* Custom Vertical Bar Indicators (Crextio pill style) */}
            <div className="pt-6">
              <div className="flex items-end justify-between gap-2 h-36 px-2">
                {/* S */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">S</span>
                </div>

                {/* M */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-20 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-medium">M</span>
                </div>

                {/* T */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-16 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-medium">T</span>
                </div>

                {/* W */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-22 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-medium">W</span>
                </div>

                {/* T */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-24 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-medium">T</span>
                </div>

                {/* F - Active Amber Bar with floating pill */}
                <div className="flex flex-col items-center gap-2 relative">
                  <span className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[9px] font-bold shadow-sm whitespace-nowrap">
                    ₹42k
                  </span>
                  <div className="w-2.5 h-28 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-amber-500 font-bold">F</span>
                </div>

                {/* S */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">S</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Circular Billing Cycle Clock Tracker (3 cols) */}
          <div className="lg:col-span-3 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Billing Cycle</span>
              <Link
                href="/admin/subscriptions"
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Circular Progress Clock Ring */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-amber-400 transition-all duration-500"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset="65"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-2xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                    02:00
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                    UTC Cron
                  </span>
                </div>
              </div>
            </div>

            {/* Playback action controls below ring */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRunBilling}
                disabled={billingRunning}
                className="p-2.5 rounded-full bg-[#181D24] text-white hover:bg-slate-800 shadow-sm transition-transform active:scale-95"
                title="Run Billing Now"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={loadData}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="Refresh Metrics"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <div className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Column 4: Dark Charcoal Operations Card (3 cols) */}
          <div className="lg:col-span-3 p-6 rounded-[2rem] bg-[#181D24] text-white shadow-crextio-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">Billing Tasks</h3>
                  <span className="text-[10px] text-slate-400">Automated engine</span>
                </div>
                <span className="text-2xl font-light text-white tabular-nums">7/8</span>
              </div>

              {/* Segmented Yellow Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="w-[85%] h-full bg-amber-400 rounded-full" />
              </div>

              {/* Task Items with circular yellow checkmarks */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-200 text-[11px]">Idempotency Guard</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">100%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-200 text-[11px]">Month-End Clamping</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">100%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-200 text-[11px]">Discount Maximizer</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">100%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-200 text-[11px]">Resend Email Delivery</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Active</span>
                </div>
              </div>
            </div>

            {/* Run Billing Action Button */}
            <div className="pt-6">
              <Button
                onClick={handleRunBilling}
                isLoading={billingRunning}
                className="w-full h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-sm gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Execute Billing Run
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Calendar Renewal Schedule & Overdue Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Calendar Schedule Card (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Subscription Renewal Calendar
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">October — November 2026</span>
            </div>

            {/* Timeline Pills */}
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#181D24] text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 font-bold text-[10px]">
                    24 OCT
                  </span>
                  <div>
                    <h4 className="font-bold text-xs">Apex Retail Pvt Ltd — Annual Business Renewal</h4>
                    <p className="text-[10px] text-slate-400">SUB-00101 • ₹19,999/yr</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400">Active</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-[10px]">
                    28 OCT
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-amber-200">
                      BlueWave Logistics — Monthly Starter Billing
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-amber-400/80">SUB-00102 • ₹2,560/mo (Odoo brand)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Upcoming</span>
              </div>
            </div>
          </div>

          {/* Overdue Watchlist Card (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Overdue Invoices
              </span>
              <span className="text-xs font-bold text-rose-500">
                ₹{(data?.kpis?.overdueAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2">
              {(data?.overdueInvoices || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  ✨ Zero overdue invoices! All payments are current.
                </div>
              ) : (
                data.overdueInvoices.slice(0, 3).map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{inv.number}</div>
                      <div className="text-[10px] text-slate-400">{inv.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-600 tabular-nums">
                        <MoneyText amount={inv.balance} />
                      </div>
                      <div className="text-[10px] text-rose-500 font-medium">{inv.daysOverdue}d overdue</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
