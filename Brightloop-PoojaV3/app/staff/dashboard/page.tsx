"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/shared/money-text";
import {
  Users,
  CreditCard,
  Receipt,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Briefcase,
  Play,
  RotateCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function StaffDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

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

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Top Welcoming Header (Crextio/Nixtio style) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900 dark:text-white">
            Welcome in, <span className="font-semibold">Staff Operations</span>
          </h1>

          {/* Lifecycle Segmented Pill Progress Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Draft Quotes</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#181D24] text-white text-[10px] font-bold">12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Awaiting Invoice</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">8</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Active Subs</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
                {data?.kpis?.activeSubscriptions ?? 78}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: 3 Big Geometric Number Counters */}
        <div className="flex items-center gap-6 sm:gap-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
              {data?.kpis?.activeSubscriptions ?? 78}
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Active Subs
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
              {data?.kpis?.totalCustomers ?? 18}
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Customers
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
              ₹{Math.round((data?.kpis?.outstandingAmount || 45000) / 1000)}k
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Outstanding
            </span>
          </div>
        </div>
      </div>

      {/* 4 Bento Widget Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Column 1: Staff Profile Spotlight (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio">
          <div className="space-y-4">
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
              <div className="self-end px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-bold shadow-sm">
                Staff Officer
              </div>

              <div className="space-y-0.5">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Arun Kumar
                </h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  Sales & Operations Lead
                </p>
              </div>
            </div>

            {/* Fast Quick Links */}
            <div className="space-y-1.5 pt-2 text-xs">
              <Link
                href="/staff/customers"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="font-medium">Customer Accounts</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/staff/subscriptions"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="font-medium">Subscriptions & Quotes</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/staff/invoices"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="font-medium">Draft & Confirmed Invoices</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/staff/payments"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="font-medium">Record Direct Payment</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Column 2: Weekly Invoices & Activity (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Daily Quotes</span>
              <Link
                href="/staff/subscriptions"
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light tracking-tight text-slate-900 dark:text-white">
                  18 Quotes
                </span>
                <span className="text-[11px] text-slate-400">This cycle</span>
              </div>
            </div>
          </div>

          {/* Vertical Bar Graph */}
          <div className="pt-6">
            <div className="flex items-end justify-between gap-2 h-36 px-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">S</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-20 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-medium">M</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-16 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-medium">T</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-22 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-medium">W</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-24 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-medium">T</span>
              </div>
              <div className="flex flex-col items-center gap-2 relative">
                <span className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[9px] font-bold shadow-sm whitespace-nowrap">
                  7 Quotes
                </span>
                <div className="w-2.5 h-28 rounded-full bg-amber-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] text-amber-500 font-bold">F</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">S</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Shift & Work Tracker (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Active Shift</span>
            <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

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
                  className="stroke-amber-400"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="90"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                  05:42
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                  Logged In
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-full bg-[#181D24] text-white hover:bg-slate-800 shadow-sm"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/staff/subscriptions"
              className="p-2.5 rounded-full bg-amber-400 text-slate-900 font-bold"
              title="Create New Quote"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </div>
        </div>

        {/* Column 4: Dark Charcoal Operations Checklist (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-[2rem] bg-[#181D24] text-white shadow-crextio-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-white">Daily Tasks</h3>
                <span className="text-[10px] text-slate-400">Operations Checklist</span>
              </div>
              <span className="text-2xl font-light text-white tabular-nums">4/6</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="w-[66%] h-full bg-amber-400 rounded-full" />
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-200 text-[11px]">Follow-up on Expiring Subs</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-200 text-[11px]">Approve Draft Quotations</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-200 text-[11px]">Verify Bank Wire Payments</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-200 text-[11px]">Dispatch Tax Invoices</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/staff/subscriptions"
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-sm transition-colors"
            >
              + Create Quotation
            </Link>
          </div>
        </div>
      </div>

      {/* Overdue and Recent Customer Invoices Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-8 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Recent Invoices Awaiting Payment
            </span>
            <Link href="/staff/invoices" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {(data?.overdueInvoices || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ✨ All customer accounts are up to date!
              </div>
            ) : (
              data.overdueInvoices.slice(0, 4).map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{inv.number}</div>
                    <div className="text-[10px] text-slate-400">{inv.customerName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                        <MoneyText amount={inv.balance} />
                      </div>
                      <div className="text-[10px] text-amber-500 font-medium">Pending</div>
                    </div>
                    <Link
                      href={`/staff/payments?invoiceId=${inv.id}`}
                      className="px-3 py-1.5 rounded-full bg-[#181D24] text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Record Payment
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Actions */}
        <div className="lg:col-span-4 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Quick Actions
            </span>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/staff/subscriptions"
              className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-white">Draft New Subscription</div>
              <div className="text-[10px] text-slate-400">Select customer and attach pricing plan</div>
            </Link>

            <Link
              href="/staff/customers"
              className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-white">Customer Directory</div>
              <div className="text-[10px] text-slate-400">Search customer profiles and subscriptions</div>
            </Link>

            <Link
              href="/staff/payments"
              className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-white">Log Bank / UPI Payment</div>
              <div className="text-[10px] text-slate-400">Match transaction reference to invoice</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
