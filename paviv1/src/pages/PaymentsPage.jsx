import React, { useState } from 'react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { usePayments } from '../hooks/usePayments';
import { useDemoMode } from '../context/DemoModeContext';
import { PaymentReceiptModal } from '../components/payments/PaymentReceiptModal';
import {
  CreditCard,
  Search,
  Printer,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Hash,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export function PaymentsPage() {
  const { isDemoMode, currency } = useDemoMode();

  const {
    payments,
    filteredPayments,
    paginatedPayments,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    successMsg,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    paymentMetrics,
    recordPayment,
    refundPayment,
    generateReceiptPdf,
    refreshPayments,
    clearFeedback,
  } = usePayments();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Status Filter Tabs
  const statusTabs = [
    { key: 'all', label: 'All Payments', count: paymentMetrics.totalCount },
    { key: 'succeeded', label: 'Succeeded', count: paymentMetrics.succeededCount },
    { key: 'pending', label: 'Pending', count: paymentMetrics.pendingCount },
    { key: 'failed', label: 'Failed', count: paymentMetrics.failedCount },
  ];

  const handleOpenReceipt = (payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearFeedback} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-red-700 dark:text-red-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearFeedback} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payments & Transaction Gateway
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              Module 7
            </Badge>
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                Live Gateway Feeds
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            UPI AutoPay &bull; NetBanking &bull; NACH Mandates &bull; Corporate Cards &bull; Instant Settlement Reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPayments}
            className="gap-2 text-xs rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Gateway
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Collections */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Collections
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
              {formatCurrency(paymentMetrics.totalCollected, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{paymentMetrics.succeededCount} Settled Transactions</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Gateway Success Rate */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Success Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-2">
              {paymentMetrics.successRate}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <span>{paymentMetrics.failedCount} Failed Retries</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Total Transactions */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Transactions
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Hash className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-2">
              {paymentMetrics.totalCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Across all banking channels</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Refunded Total */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Reversals & Refunds
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
              {formatCurrency(paymentMetrics.refundedTotal, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <span>Customer claim settlements</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    statusFilter === tab.key
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted-foreground/15 text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI / AutoPay</option>
              <option value="NetBanking">NetBanking</option>
              <option value="NEFT">NEFT / RTGS</option>
              <option value="NACH">NACH Mandate</option>
              <option value="Card">Corporate Cards</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Txn #, invoice, customer..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
              <tr>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Channel & Gateway</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading payment records...
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">No payment records found.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/10 transition-colors group cursor-pointer"
                    onClick={() => handleOpenReceipt(p)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 opacity-70" />
                        <span>{p.txnRef}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                      {p.invoiceNumber || 'Direct Payment'}
                    </td>

                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="font-bold text-foreground truncate">
                        {p.customerCompany || p.customerName}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {p.customerName} &bull; GST: {p.gstinRef?.slice(0, 8)}...
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground text-[11px]">
                        {p.method}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground">
                        {p.gateway || 'Razorpay Gateway'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground text-[11px]">
                      {p.date ? new Date(p.date).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(p.amount, currency)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusPill status={p.status} />
                    </td>

                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateReceiptPdf(p)}
                          className="h-8 px-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg"
                          title="Download Official Receipt Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenReceipt(p)}
                          className="h-8 px-2 text-muted-foreground hover:text-primary rounded-lg text-xs"
                        >
                          Voucher
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{Math.min(totalItems, (currentPage - 1) * 10 + 1)}</span> to{' '}
            <span className="font-semibold text-foreground">{Math.min(totalItems, currentPage * 10)}</span> of{' '}
            <span className="font-semibold text-foreground">{totalItems}</span> transactions
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 font-mono font-semibold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedPayment}
        onPrintReceipt={generateReceiptPdf}
        onRefund={refundPayment}
        currency={currency}
      />
    </div>
  );
}
