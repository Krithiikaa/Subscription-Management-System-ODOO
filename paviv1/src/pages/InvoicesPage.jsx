import React, { useState } from 'react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { useInvoices } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useProducts } from '../hooks/useProducts';
import { useDemoMode } from '../context/DemoModeContext';
import { InvoiceFormModal } from '../components/invoices/InvoiceFormModal';
import { InvoiceDetailsModal } from '../components/invoices/InvoiceDetailsModal';
import { RecordPaymentModal } from '../components/invoices/RecordPaymentModal';
import {
  FileText,
  Plus,
  Search,
  Printer,
  CreditCard,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export function InvoicesPage() {
  const { isDemoMode, currency } = useDemoMode();

  const {
    invoices,
    filteredInvoices,
    paginatedInvoices,
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
    invoiceMetrics,
    createInvoice,
    updateInvoiceStatus,
    recordPaymentForInvoice,
    runRecurringBillingAutomation,
    generateInvoicePdf,
    refreshInvoices,
    clearFeedback,
  } = useInvoices();

  const { customers } = useCustomers();
  const { subscriptions } = useSubscriptions();
  const { products } = useProducts();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [recordPaymentInvoice, setRecordPaymentInvoice] = useState(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);

  // Status Filter Tabs
  const statusTabs = [
    { key: 'all', label: 'All Invoices', count: invoiceMetrics.totalCount },
    { key: 'paid', label: 'Paid & Settled', count: invoiceMetrics.paidCount },
    { key: 'pending', label: 'Pending', count: invoiceMetrics.pendingCount },
    { key: 'overdue', label: 'Overdue', count: invoiceMetrics.overdueCount },
    { key: 'draft', label: 'Draft', count: invoiceMetrics.draftCount },
  ];

  const handleOpenDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  const handleOpenRecordPayment = (invoice) => {
    setRecordPaymentInvoice(invoice);
    setIsRecordPaymentOpen(true);
  };

  const handleRunAutomation = async () => {
    setIsAutomating(true);
    await runRecurringBillingAutomation();
    setIsAutomating(false);
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
              Invoices & Billing Receivables
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              Module 7
            </Badge>
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                Tamil Nadu Enterprise Data
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Form GST INV-1 compliant billing engine &bull; 18% GST (9% CGST + 9% SGST) &bull; Recurring cycle automation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAutomation}
            disabled={isAutomating}
            className="gap-2 text-xs rounded-xl"
            title="Automatically bills all active subscriptions due today"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-500 ${isAutomating ? 'animate-spin' : ''}`} />
            {isAutomating ? 'Billing...' : 'Run Billing Engine'}
          </Button>

          <Button
            onClick={() => setIsFormOpen(true)}
            size="sm"
            className="gap-2 text-xs rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Invoiced */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Invoiced
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-2">
              {formatCurrency(invoiceMetrics.totalInvoiced, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{invoiceMetrics.totalCount} Total Invoices</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Paid & Collected */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Collected (Paid)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
              {formatCurrency(invoiceMetrics.totalPaid, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              <span>{invoiceMetrics.paidCount} Fully Settled Invoices</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Pending Receivables */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Outstanding (Pending)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-2">
              {formatCurrency(invoiceMetrics.totalPending, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>{invoiceMetrics.pendingCount} Awaiting Payment</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Overdue Amount */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overdue Receivables
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-2">
              {formatCurrency(invoiceMetrics.totalOverdue, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>{invoiceMetrics.overdueCount} Past Due Invoices</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar & Search */}
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

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, customer, or GSTIN..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4">Taxable Value</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading billing invoices...
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">No invoices found matching criteria.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your status filter or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const isOverdue = inv.status === 'overdue';
                  const dueTime = new Date(inv.dueDate).getTime();
                  const nowTime = Date.now();
                  const daysDiff = Math.ceil((nowTime - dueTime) / (1000 * 60 * 60 * 24));
                  const isPastDue = (isOverdue || inv.status === 'pending') && daysDiff > 0;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/10 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetails(inv)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 opacity-70" />
                          <span>{inv.invoiceNumber || inv.number}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-bold text-foreground truncate">
                          {inv.customerCompany || inv.customerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {inv.customerName} &bull; {inv.customerCity || 'TN'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-foreground">{formatDate(inv.issueDate)}</div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>Due: {formatDate(inv.dueDate)}</span>
                          {isPastDue && !isPaid && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-500/10 px-1 py-0.2 rounded">
                              +{daysDiff}d
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        {formatCurrency(inv.subtotal || inv.amount, currency)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        {formatCurrency(inv.totalTax || inv.gstAmount, currency)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(inv.totalAmount, currency)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                        <span className="text-[11px] truncate block max-w-[140px]">
                          {inv.paymentMethod || 'Awaiting Clearance'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill status={inv.status} />
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateInvoicePdf(inv)}
                            className="h-8 px-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-lg"
                            title="Print GST Tax Invoice PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>

                          {!isPaid && inv.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenRecordPayment(inv)}
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1"
                              title="Record Payment Settlement"
                            >
                              <CreditCard className="w-3 h-3" /> Pay
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(inv)}
                            className="h-8 px-2 text-muted-foreground hover:text-primary rounded-lg text-xs"
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{Math.min(totalItems, (currentPage - 1) * 10 + 1)}</span> to{' '}
            <span className="font-semibold text-foreground">{Math.min(totalItems, currentPage * 10)}</span> of{' '}
            <span className="font-semibold text-foreground">{totalItems}</span> invoices
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

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={createInvoice}
        customers={customers}
        subscriptions={subscriptions}
        products={products}
        currency={currency}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        invoice={selectedInvoice}
        onDownloadPdf={generateInvoicePdf}
        onOpenRecordPayment={handleOpenRecordPayment}
        onUpdateStatus={updateInvoiceStatus}
        currency={currency}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        invoice={recordPaymentInvoice}
        onRecordPayment={recordPaymentForInvoice}
        currency={currency}
      />
    </div>
  );
}
