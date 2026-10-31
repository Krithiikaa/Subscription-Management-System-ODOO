import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, PieChart, BarChart3, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';

export function AdminChartsSection({
  isDemoMode,
  monthlyRevenueData = [],
  subscriptionStatusData = [],
  invoiceStatusData = [],
  currency = 'INR',
}) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Maximum value for proportional bar scaling
  const maxRevenue = Math.max(...monthlyRevenueData.map((d) => d.revenue || 0), 700000);

  const totalSubscriptions = subscriptionStatusData.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
  const totalInvoices = invoiceStatusData.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* 1. Monthly Revenue Trend Chart */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recurring Revenue Growth (2026)</span>
            </div>
          }
          subtitle={
            isDemoMode
              ? 'Monthly ARR/MRR progression across Tamil Nadu & Indian enterprise accounts'
              : 'Live MRR progression will render as paid invoices accumulate'
          }
          action={
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shadow-2xs">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {isDemoMode ? '+355% YTD Growth' : 'Tracking Active'}
            </span>
          }
        />

        <CardContent className="flex-1 flex flex-col justify-between pt-2">
          {monthlyRevenueData.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No monthly revenue data available yet</p>
            </div>
          ) : (
            <div>
              {/* Active Hover Value Callout */}
              <div className="h-9 mb-2 flex items-center justify-between text-xs">
                {hoveredMonth ? (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 dark:text-white">
                      {hoveredMonth.month}:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(hoveredMonth.revenue, currency)}
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      ({hoveredMonth.subscriptions} active subs)
                    </span>
                  </div>
                ) : (
                  <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                    Hover over bars to inspect monthly breakdown & subscriber count
                  </span>
                )}
                <span className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
                  Oct 2026 Peak: {formatCurrency(682450, currency)}
                </span>
              </div>

              {/* Bar Chart Container */}
              <div className="h-44 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-stone-200 dark:border-stone-800">
                {monthlyRevenueData.map((d, index) => {
                  const heightPercent = Math.max(12, Math.round((d.revenue / maxRevenue) * 100));
                  const isCurrent = index === monthlyRevenueData.length - 1;

                  return (
                    <div
                      key={d.month}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(d)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div className="w-full relative flex flex-col items-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[32px] rounded-t-md transition-all duration-200 ${
                            isCurrent
                              ? 'bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 shadow-sm'
                              : 'bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mt-2">
                        {d.month.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend & Summary Info */}
              <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-stone-300 dark:bg-stone-700" />
                    <span>Prior Months</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 dark:bg-amber-500" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">Current (Oct)</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                  Target ARR: {formatCurrency(10000000, currency)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Subscription Status Breakdown & Collections Health */}
      <Card className="flex flex-col">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Contract & Billing Health</span>
            </div>
          }
          subtitle="Portfolio status across all 35 subscriptions"
        />

        <CardContent className="space-y-6 pt-2">
          {/* Subscription State Breakdown */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-stone-900 dark:text-white">
                Subscription Lifecycle
              </span>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">
                {totalSubscriptions} Total Contracts
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 flex overflow-hidden gap-0.5">
              {subscriptionStatusData.map((item) => {
                const widthPercent = (item.count / totalSubscriptions) * 100;
                return (
                  <div
                    key={item.status}
                    style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                    title={`${item.status}: ${item.count} (${widthPercent.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Status Legend Pills */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {subscriptionStatusData.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-stone-600 dark:text-stone-300 truncate">
                      {item.status}
                    </span>
                  </div>
                  <span className="font-bold text-[11px] text-stone-900 dark:text-white ml-1">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Collections Status */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-stone-900 dark:text-white">
                Invoice Collections Health
              </span>
              <span className="text-stone-400 dark:text-stone-500 text-[11px]">
                {totalInvoices} Invoices
              </span>
            </div>

            <div className="space-y-2">
              {invoiceStatusData.map((item) => {
                const percent = Math.round((item.count / totalInvoices) * 100);
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-600 dark:text-stone-300 font-medium flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.status} ({item.count})
                      </span>
                      <span className="font-mono font-semibold text-stone-900 dark:text-white">
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
