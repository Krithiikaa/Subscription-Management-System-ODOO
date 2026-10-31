import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';
import { SubscriptionDetailsModal } from '../components/subscriptions/SubscriptionDetailsModal';
import {
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const STATUS_TABS = [
  { key: 'all', label: 'All Contracts' },
  { key: 'active', label: 'Active' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_trial', label: 'In Trial' },
  { key: 'paused', label: 'Paused' },
  { key: 'past_due', label: 'Past Due' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'closed', label: 'Closed' },
];

export function SubscriptionsPage() {
  const { role } = useAuth();
  const { isDemoMode, currency } = useDemoMode();

  const {
    subscriptions,
    filteredSubscriptions,
    paginatedSubscriptions,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    loading,
    error,
    successMsg,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    confirmSubscription,
    activateSubscription,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    closeSubscription,
    clearFeedback,
  } = useSubscriptions();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const handleOpenDetails = (sub) => {
    setSelectedSubscription(sub);
    setIsDetailsOpen(true);
  };

  // KPI Calculations
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const activeMrr = activeSubs.reduce((sum, s) => {
    const rate = s.totalAmount || s.amount || 0;
    return sum + (s.billingCycle === 'Annual' ? rate / 12 : rate);
  }, 0);
  const trialCount = subscriptions.filter((s) => s.status === 'in_trial').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused' || s.status === 'past_due').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              Subscription Contracts & Lifecycle Operations
            </span>

            {isDemoMode ? (
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md">
                Demo Dataset (35 Indian Contracts)
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                Live Database Mode
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Subscription Lifecycle Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Govern customer contracts from quotation confirmation to active renewal, automated proration, temporary pauses, and graceful termination.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" size="md">
            Lifecycle Engine
          </Badge>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {(successMsg || error) && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
            error
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{error || successMsg}</span>
          </div>
          <button
            onClick={clearFeedback}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold px-2 py-0.5"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-stone-50 to-emerald-50/20 dark:from-stone-900 dark:to-emerald-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300 mt-2">
            {activeSubs.length}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Recurring enterprise accounts</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-amber-50/20 dark:from-stone-900 dark:to-amber-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Monthly MRR</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-2 font-mono">
            {formatCurrency(Math.round(activeMrr), currency)}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Normalized monthly recurring revenue</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-blue-50/20 dark:from-stone-900 dark:to-blue-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">In-Trial Accounts</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-blue-700 dark:text-blue-300 mt-2">
            {trialCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Nearing evaluation conversion</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-rose-50/20 dark:from-stone-900 dark:to-rose-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Paused / At-Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-2">
            {pausedCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Dunning or paused state</p>
        </Card>
      </div>

      {/* Lifecycle Status Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto text-xs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.key
                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <Card>
        <div className="p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contracts by subscription #, customer, email, or plan name..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader
          title="Contracts Register"
          subtitle={`Showing ${paginatedSubscriptions.length} of ${totalItems} active and historical contracts (Page ${currentPage} of ${totalPages})`}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Contract # & Plan</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Cycle & Rate</th>
                  <th className="py-3 px-4">Next Renewal</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      Loading subscription contracts...
                    </td>
                  </tr>
                ) : paginatedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No contracts found with status '{statusFilter}'.
                    </td>
                  </tr>
                ) : (
                  paginatedSubscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-900/40 transition-colors"
                    >
                      {/* Contract # & Plan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-stone-900 dark:text-white">
                            {sub.subscriptionNumber || sub.id}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded">
                            {sub.billingCycle}
                          </span>
                        </div>
                        <p className="font-medium text-stone-700 dark:text-stone-300 mt-0.5">
                          {sub.planName || 'Recurring Plan'}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900 dark:text-white">
                          {sub.customerName}
                        </p>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-stone-400" />
                          {sub.customerCompany || sub.customerEmail}
                        </p>
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-white">
                        {formatCurrency(sub.totalAmount || sub.amount, currency)}
                        <p className="text-[10px] font-normal text-stone-400">
                          per {sub.billingCycle.toLowerCase()}
                        </p>
                      </td>

                      {/* Renewal Date */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <p className="text-stone-800 dark:text-stone-200">
                          {formatDate(sub.nextBillingDate || sub.nextBilling)}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                          {sub.autoRenew ? '✓ Auto-Renew' : 'Manual'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusPill status={sub.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Stepper & History */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(sub)}
                            title="Inspect Lifecycle & History"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Lifecycle Controls */}
                          {sub.status === 'confirmed' && (
                            <Button
                              variant="primary"
                              size="xs"
                              icon={Play}
                              onClick={() => activateSubscription(sub.id)}
                            >
                              Activate
                            </Button>
                          )}

                          {sub.status === 'active' && (
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Pause}
                              onClick={() => pauseSubscription(sub.id)}
                            >
                              Pause
                            </Button>
                          )}

                          {sub.status === 'paused' && (
                            <Button
                              variant="primary"
                              size="xs"
                              icon={Play}
                              onClick={() => resumeSubscription(sub.id)}
                            >
                              Resume
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <p>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  icon={ChevronLeft}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Prev
                </Button>
                <span className="px-2 text-stone-700 dark:text-stone-300 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  icon={ChevronRight}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal with Lifecycle Controller */}
      <SubscriptionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        subscription={selectedSubscription}
        onConfirm={confirmSubscription}
        onActivate={activateSubscription}
        onPause={pauseSubscription}
        onResume={resumeSubscription}
        onRenew={renewSubscription}
        onCloseSubscription={closeSubscription}
        currency={currency}
      />
    </div>
  );
}
