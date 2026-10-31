import React from 'react';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { SubscriptionStatusChart } from '../components/dashboard/SubscriptionStatusChart';
import { RecentSubscriptionsTable } from '../components/dashboard/RecentSubscriptionsTable';
import { RecentInvoicesTable } from '../components/dashboard/RecentInvoicesTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              Brightloop Cloud
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {today}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription & Revenue Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of active subscriptions, enterprise plans, cash collection, and billing health.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
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

      {/* Charts Section: Monthly Revenue & Subscription Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <SubscriptionStatusChart />
        </div>
      </section>

      {/* Tables Section: Recent Subscriptions & Recent Invoices */}
      <section className="space-y-6">
        <RecentSubscriptionsTable />
        <RecentInvoicesTable />
      </section>
    </div>
  );
}
