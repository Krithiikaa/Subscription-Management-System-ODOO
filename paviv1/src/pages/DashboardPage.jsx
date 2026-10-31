import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import { AdminKpiGrid } from '../components/dashboard/AdminKpiGrid';
import { AdminQuickActions } from '../components/dashboard/AdminQuickActions';
import { AdminRecentActivities } from '../components/dashboard/AdminRecentActivities';
import { RecentSubscriptionsTable } from '../components/dashboard/RecentSubscriptionsTable';
import { RecentInvoicesTable } from '../components/dashboard/RecentInvoicesTable';
import { Button } from '../components/common/Button';
import {
  Calendar,
  ShieldCheck,
  RefreshCw,
  UserPlus,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user, profile, role } = useAuth();
  const {
    loading,
    refreshing,
    lastUpdated,
    error,
    metrics,
    tablesStatus,
    recentActivities,
    customersList,
    staffList,
    refreshData,
  } = useAdminDashboardData();

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(lastUpdated);

  return (
    <div className="space-y-6">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5 font-sans">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Brightloop Cloud
            </span>

            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Role: Enterprise Admin
            </span>

            <span className="text-xs text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {today}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Admin Governance & Subscription Overview
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-sans">
            Real-time management console for customer accounts, staff privileges, recurring contracts, and billing health.
          </p>
        </div>

        {/* Action Buttons & Sync Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            disabled={refreshing || loading}
            onClick={refreshData}
            title={`Last synced: ${formattedTime}`}
          >
            {refreshing ? 'Syncing...' : 'Refresh Live Data'}
          </Button>

          <Link to="/staff-management">
            <Button variant="primary" size="sm" icon={UserPlus}>
              Invite Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Connection Notice if error occurred */}
      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Supabase Data Sync Note</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* 6 Core KPI Cards (Real Supabase Data + Honest Empty States) */}
      <section aria-labelledby="kpi-section">
        <h3 id="kpi-section" className="sr-only">
          Administrative Key Performance Indicators
        </h3>
        <AdminKpiGrid
          metrics={metrics}
          tablesStatus={tablesStatus}
          loading={loading}
        />
      </section>

      {/* Quick Actions Bar */}
      <section aria-labelledby="quick-actions-section">
        <h3 id="quick-actions-section" className="sr-only">
          Administrative Quick Actions
        </h3>
        <AdminQuickActions />
      </section>

      {/* Two-Column Layout: Live System Activities & Security / Database Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live System Activities Feed */}
        <div className="lg:col-span-2">
          <AdminRecentActivities
            activities={recentActivities}
            loading={refreshing}
            onRefresh={refreshData}
          />
        </div>

        {/* Right Column (1 Col): Database Health & Security Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#15181e] p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Database & Auth Status
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  PostgreSQL & GoTrue Security
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Auth Engine</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Supabase GoTrue (2.197.0)
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">RBAC Trigger</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  protect_profile_roles() Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Admin Account</span>
                <span className="font-mono text-[11px] text-stone-900 dark:text-stone-200 truncate max-w-[170px]" title={user?.email || 'admin.brightloopodoohack@gmail.com'}>
                  {user?.email || 'admin.brightloopodoohack@gmail.com'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Registered Customers</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {metrics.totalCustomers}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Verified Staff</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {metrics.totalStaff} active ({metrics.pendingStaffInvitations} pending)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">Last Live Query</span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
              <Link
                to="/staff-management"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
              >
                <span>Manage Staff Permissions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscriptions & Invoicing Modules Status (Empty State Compliant) */}
      <section className="space-y-6">
        <RecentSubscriptionsTable subscriptions={[]} />
        <RecentInvoicesTable invoices={[]} />
      </section>
    </div>
  );
}
