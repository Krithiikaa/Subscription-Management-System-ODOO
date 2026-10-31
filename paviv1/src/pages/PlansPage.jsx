import React, { useState, useMemo } from 'react';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import { useProducts } from '../hooks/useProducts';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusPill } from '../components/common/StatusPill';
import { PlanFormModal } from '../components/plans/PlanFormModal';
import { PlanDetailsModal } from '../components/plans/PlanDetailsModal';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit3,
  Archive,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  Check,
  X,
} from 'lucide-react';

const BILLING_CYCLE_OPTIONS = ['ALL', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

export function PlansPage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || !role;
  const { isDemoMode, toggleDemoMode, currency } = useDemoMode();

  const {
    plans,
    loading,
    error,
    successMsg,
    setSuccessMsg,
    setError,
    addPlan,
    updatePlan,
    toggleArchivePlan,
    refreshPlans,
  } = useSubscriptionPlans();

  const { products } = useProducts();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchesCycle =
        selectedCycle === 'ALL' ||
        (p.billingCycle && p.billingCycle.toLowerCase() === selectedCycle.toLowerCase());
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query));

      return matchesStatus && matchesCycle && matchesSearch;
    });
  }, [plans, selectedStatus, selectedCycle, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPlans.length / pageSize) || 1;
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, currentPage]);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingPlan) {
      await updatePlan(editingPlan.id, formData);
    } else {
      await addPlan(formData);
    }
  };

  // Helper to find linked product
  const getLinkedProduct = (productId) => {
    return products.find((p) => p.id === productId);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Module 4 &bull; Subscription Plans
            </span>
            <span className="text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-stone-500 dark:text-stone-400">
              {isDemoMode ? '30 Configured Pricing Tiers' : 'Live Supabase Plans'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Subscription Plan Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure recurring billing cadences (Daily, Weekly, Monthly, Yearly), pricing rules in INR (₹), product bindings, and renewal terms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshPlans}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            disabled={!isAdmin && !isDemoMode}
            title={!isAdmin && !isDemoMode ? 'Admin privileges required to create plans' : undefined}
          >
            Create Plan
          </Button>
        </div>
      </div>

      {/* Mode Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center shrink-0">
            {isDemoMode ? <Sparkles className="w-4 h-4" /> : <Database className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-bold text-stone-900 dark:text-white">
              {isDemoMode
                ? 'Demo Mode Active: Tamil Nadu Subscription Plans (₹ INR)'
                : 'Live Database Mode: Supabase public.subscription_plans'}
            </span>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              {isDemoMode
                ? 'Displaying 30 recurring billing plans with Daily, Weekly, Monthly, and Yearly cadences. Local edits persist in browser.'
                : 'Connected to PostgreSQL. Modifying requires verified admin authorization.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleDemoMode}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0 shadow-2xs"
        >
          {isDemoMode ? 'Switch to Live DB Mode' : 'Switch to Demo Mode (30 Plans)'}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="flex flex-col">
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plans by name, code, or terms..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Billing Cycle Filter */}
            <select
              value={selectedCycle}
              onChange={(e) => {
                setSelectedCycle(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            >
              {BILLING_CYCLE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Billing Cycles' : `${c} Cadence`}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="active">Active Only</option>
              <option value="archived">Archived</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Plans Table */}
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              <span>Loading subscription plans...</span>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
                No Plans Found
              </h4>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                {searchTerm || selectedCycle !== 'ALL' || selectedStatus !== 'active'
                  ? 'No plans match your current search or filter criteria.'
                  : 'Your live plans database is currently empty. Click "Create Plan" to define your first subscription plan.'}
              </p>
              <div className="mt-4">
                <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
                  Create First Plan
                </Button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Plan Name & Code</th>
                  <th className="py-3 px-4">Billing Cadence</th>
                  <th className="py-3 px-4">Plan Price (₹)</th>
                  <th className="py-3 px-4">Linked Product</th>
                  <th className="py-3 px-4">Validity Range</th>
                  <th className="py-3 px-4">Key Policies</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {paginatedPlans.map((plan) => {
                  const linkedProd = getLinkedProduct(plan.productId);

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors shadow-2xs">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 dark:text-white truncate">
                              {plan.name}
                            </p>
                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                              {plan.code || 'PLN-AUTO'} &bull; Min: {plan.minQuantity || 1} seat(s)
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                          {plan.billingCycle}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white font-mono text-sm">
                        {formatCurrency(plan.price, currency)}
                        <span className="text-[10px] text-stone-400 font-normal block">
                          /{plan.billingCycle?.toLowerCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {linkedProd ? (
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="font-medium text-stone-800 dark:text-stone-200 truncate max-w-[140px]" title={linkedProd.name}>
                              {linkedProd.name}
                            </span>
                          </div>
                        ) : plan.product ? (
                          <span className="text-stone-800 dark:text-stone-200">{plan.product.name}</span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Standalone</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 text-[11px]">
                        {plan.availableFrom ? formatDate(plan.availableFrom) : 'Open'} &rarr;{' '}
                        {plan.availableUntil ? formatDate(plan.availableUntil) : 'Indefinite'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          {plan.allowRenewal && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="Auto-renewal allowed">
                              Auto-Renew
                            </span>
                          )}
                          {plan.allowPause && (
                            <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300" title="Temporary pause allowed">
                              Pause
                            </span>
                          )}
                          {plan.closeAtEndOfPeriod && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800" title="Close at period end">
                              End-Close
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusPill status={plan.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedPlan(plan)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                            title="View Plan Specifications"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(plan)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Edit Plan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleArchivePlan(plan.id, plan.status)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                            title={plan.status === 'active' ? 'Archive Plan' : 'Unarchive Plan'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {filteredPlans.length > pageSize && (
          <CardFooter className="flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredPlans.length)} of {filteredPlans.length}{' '}
              plans
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-2 text-stone-700 dark:text-stone-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Form Modal (Add / Edit) */}
      <PlanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialPlan={editingPlan}
        availableProducts={products}
        currency={currency}
      />

      {/* Details Modal */}
      <PlanDetailsModal
        isOpen={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        linkedProduct={selectedPlan ? getLinkedProduct(selectedPlan.productId) : null}
        onEdit={(p) => {
          setSelectedPlan(null);
          handleOpenEdit(p);
        }}
        onToggleArchive={(id, st) => {
          toggleArchivePlan(id, st);
          setSelectedPlan(null);
        }}
        currency={currency}
      />
    </div>
  );
}
