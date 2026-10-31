import React from 'react';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { SubscriptionStatusChart } from '../components/dashboard/SubscriptionStatusChart';
import { InvoiceStatusBreakdownChart } from '../components/dashboard/InvoiceStatusBreakdownChart';
import { RecentSubscriptionsTable } from '../components/dashboard/RecentSubscriptionsTable';
import { RecentInvoicesTable } from '../components/dashboard/RecentInvoicesTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Download,
  Plus,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-sans">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Brightloop Cloud
            </span>
            <span className="text-xs text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {today}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Subscription & Revenue Overview
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-sans">
            Real-time analytics for active contracts, MRR growth, receivables collection, and billing health.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert('Exporting Brightloop subscription audit metrics (CSV/Excel)...')}
          >
            Export Metrics
          </Button>

          <Link to="/subscriptions">
            <Button variant="primary" size="sm" icon={Plus}>
              New Subscription
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <section aria-labelledby="kpi-section">
        <h3 id="kpi-section" className="sr-only">
          Key Performance Indicators
        </h3>
        <KpiGrid />
      </section>

      {/* Charts Section: Revenue Trend & Subscription Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <SubscriptionStatusChart />
        </div>
      </section>

      {/* 3rd Chart Section: Invoice Status Breakdown */}
      <section>
        <InvoiceStatusBreakdownChart />
      </section>

      {/* Tables Section: Recent Subscriptions & Recent Invoices */}
      <section className="space-y-6">
        <RecentSubscriptionsTable />
        <RecentInvoicesTable />
      </section>
    </div>
  );
}
