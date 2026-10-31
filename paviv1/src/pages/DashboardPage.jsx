import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import { AdminKpiGrid } from '../components/dashboard/AdminKpiGrid';
import { AdminChartsSection } from '../components/dashboard/AdminChartsSection';
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
  Sparkles,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user, profile, role } = useAuth();
  const {
    isDemoMode,
    toggleDemoMode,
    currency,
    currencySymbol,
    demoMetrics,
    monthlyRevenueData,
    subscriptionStatusData,
    invoiceStatusData,
    demoData,
    datasetSummary,
  } = useDemoMode();

  const {
    loading,
    refreshing,
    lastUpdated,
    error,
    metrics,
    tablesStatus,
    recentActivities,
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

  // Dynamic values depending on mode
  const activeMetrics = isDemoMode
    ? demoMetrics
    : { ...metrics, currency: 'USD' };

  const activeTablesStatus = isDemoMode
    ? {
        profiles: true,
        staff_invitations: true,
        subscriptions: true,
        invoices: true,
        payments: true,
      }
    : tablesStatus;

  const activeActivities = isDemoMode ? demoData.activities : recentActivities;
  const activeSubscriptions = isDemoMode ? demoData.subscriptions : [];
  const activeInvoices = isDemoMode ? demoData.invoices : [];

  return (
    <div className="space-y-6 font-sans">
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

      {/* Demo Mode Banner (Displaying actual 302 count and synthetic disclosure) */}
      {isDemoMode ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-700/60 shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Demo Mode Active: {datasetSummary.totalRecords} Records (Tamil Nadu & Indian SaaS Ecosystem)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/90 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-mono">
                    ₹ INR Currency
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Client-Side Isolated
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
                  Displaying {datasetSummary.totalRecords} interconnected realistic records: 35 Customers, 32 Staff, 30 Products, 30 Plans, 35 Quotations, 35 Subscriptions, 35 Invoices, 35 Payments, and 35 Activities. All GSTINs (<span className="font-mono text-amber-800 dark:text-amber-300">33DEMO...</span>) and phone numbers (<span className="font-mono text-amber-800 dark:text-amber-300">+91 98400...</span>) are synthetic demo placeholders. Live Supabase database is 100% untouched.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              <Button
                variant="outline"
                size="sm"
                icon={Database}
                onClick={toggleDemoMode}
                className="bg-white dark:bg-stone-900 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                Switch to Live DB Mode
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300/80 dark:border-emerald-700/60 shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Live Database Mode Active (Supabase PostgreSQL)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono">
                    $ USD Currency
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    Real Supabase GoTrue Auth
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
                  Connected directly to your Supabase project. Displaying production records with clean, honest empty states for tables awaiting migration. Switch to Demo Mode anytime to view the 302-record Tamil Nadu dataset.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={toggleDemoMode}
              >
                Preview 302 Demo Records (₹)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Database Connection Notice if error occurred */}
      {error && !isDemoMode && (
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

      {/* 6 Core KPI Cards (Demo Mode in ₹ INR / Live Supabase Data in $ USD) */}
      <section aria-labelledby="kpi-section">
        <h3 id="kpi-section" className="sr-only">
          Administrative Key Performance Indicators
        </h3>
        <AdminKpiGrid
          metrics={activeMetrics}
          tablesStatus={activeTablesStatus}
          loading={loading && !isDemoMode}
        />
      </section>

      {/* Interactive Visual Charts Section */}
      <section aria-labelledby="charts-section">
        <h3 id="charts-section" className="sr-only">
          Subscription and Revenue Analytics
        </h3>
        <AdminChartsSection
          isDemoMode={isDemoMode}
          monthlyRevenueData={isDemoMode ? monthlyRevenueData : []}
          subscriptionStatusData={isDemoMode ? subscriptionStatusData : []}
          invoiceStatusData={isDemoMode ? invoiceStatusData : []}
          currency={currency}
        />
      </section>

      {/* Quick Actions Bar */}
      <section aria-labelledby="quick-actions-section">
        <h3 id="quick-actions-section" className="sr-only">
          Administrative Quick Actions
        </h3>
        <AdminQuickActions />
      </section>

      {/* Two-Column Layout: System Activities & Security / Database Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): System Activities Feed */}
        <div className="lg:col-span-2">
          <AdminRecentActivities
            activities={activeActivities}
            loading={refreshing}
            onRefresh={isDemoMode ? undefined : refreshData}
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
                  Database & Security Matrix
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isDemoMode ? 'Client-Side Demo Layer Active' : 'PostgreSQL & GoTrue Security'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Data Source Mode</span>
                <span className="font-semibold text-stone-900 dark:text-white flex items-center gap-1">
                  {isDemoMode ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Demo (302 Records)
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live Supabase DB
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Active Currency</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">
                  {currency} ({currencySymbol})
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">RBAC Role Protection</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  protect_profile_roles() Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Customer Records</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {activeMetrics.totalCustomers} {isDemoMode ? '(Tamil Nadu Enterprises)' : 'registered'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                <span className="text-stone-500 dark:text-stone-400">Staff Accounts</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {activeMetrics.totalStaff} {isDemoMode ? '(Regional Offices)' : 'onboarded'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">Last Synced</span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold justify-center"
                onClick={toggleDemoMode}
              >
                {isDemoMode ? 'Toggle to Live Database ($)' : 'Toggle to Demo Mode (302 Records • ₹)'}
              </Button>

              <Link
                to="/staff-management"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
              >
                <span>Manage Staff & RBAC</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscriptions & Invoicing Modules Status (Demo Rows or Empty State) */}
      <section className="space-y-6">
        <RecentSubscriptionsTable
          subscriptions={activeSubscriptions}
          currency={currency}
        />
        <RecentInvoicesTable
          invoices={activeInvoices}
          currency={currency}
        />
      </section>
    </div>
  );
}
