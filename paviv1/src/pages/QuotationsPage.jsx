import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { useQuotations } from '../hooks/useQuotations';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useCustomers } from '../hooks/useCustomers';
import { useStaff } from '../hooks/useStaff';
import { useProducts } from '../hooks/useProducts';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';
import { QuotationFormModal } from '../components/quotations/QuotationFormModal';
import { QuotationDetailsModal } from '../components/quotations/QuotationDetailsModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  RefreshCw,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export function QuotationsPage() {
  const { role } = useAuth();
  const { isDemoMode, currency } = useDemoMode();

  const {
    quotations,
    filteredQuotations,
    paginatedQuotations,
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
    createQuotation,
    updateQuotationStatus,
    generateQuotationPdf,
    clearFeedback,
  } = useQuotations();

  const { convertQuotationToSubscription } = useSubscriptions();
  const { customers } = useCustomers();
  const { staffList } = useStaff();
  const { products } = useProducts();

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const handleOpenDetails = (q) => {
    setSelectedQuotation(q);
    setIsDetailsOpen(true);
  };

  const handleConvert = async (quotation) => {
    try {
      await convertQuotationToSubscription(quotation);
      if (selectedQuotation && selectedQuotation.id === quotation.id) {
        setSelectedQuotation({ ...selectedQuotation, status: 'converted' });
      }
    } catch (err) {
      alert(err.message || 'Failed to convert quotation.');
    }
  };

  // Quick stats
  const totalPipelineValue = quotations.reduce((sum, q) => sum + (q.grandTotal || q.totalAmount || 0), 0);
  const convertedCount = quotations.filter((q) => q.status === 'converted').length;
  const acceptedCount = quotations.filter((q) => q.status === 'accepted').length;
  const conversionRate = quotations.length > 0 ? Math.round((convertedCount / quotations.length) * 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              Sales Quotations & CPQ Pipeline
            </span>

            {isDemoMode ? (
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md">
                Demo Dataset (35 Indian CPQ Estimates)
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                Live Database Mode
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Quotation Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Draft multi-product proposals, apply 18% GST (CGST + SGST), generate downloadable PDFs, and convert accepted quotes into recurring subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsFormOpen(true)}
          >
            Create Quotation
          </Button>
        </div>
      </div>

      {/* Global Feedback Alert */}
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
        <Card className="p-4 bg-gradient-to-br from-stone-50 to-amber-50/20 dark:from-stone-900 dark:to-amber-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Proposals</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-2">
            {quotations.length}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Draft, Sent & Converted</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-emerald-50/20 dark:from-stone-900 dark:to-emerald-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300 mt-2 font-mono">
            {formatCurrency(totalPipelineValue, currency)}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Incl. 18% GST calculation</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-blue-50/20 dark:from-stone-900 dark:to-blue-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Converted Subscriptions</span>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-blue-700 dark:text-blue-300 mt-2">
            {convertedCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Active recurring contracts</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-purple-50/20 dark:from-stone-900 dark:to-purple-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Conversion Rate</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-purple-700 dark:text-purple-300 mt-2">
            {conversionRate}%
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">{acceptedCount} pending conversion</p>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotations by quote #, customer, email, or sales rep..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Quotation Statuses</option>
              <option value="draft">Draft Only</option>
              <option value="sent">Sent to Customer</option>
              <option value="accepted">Accepted (Ready to Convert)</option>
              <option value="converted">Converted to Subscription</option>
              <option value="declined">Declined</option>
            </select>

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

      {/* Quotations Table */}
      <Card>
        <CardHeader
          title="Quotations Register"
          subtitle={`Showing ${paginatedQuotations.length} of ${totalItems} filtered quotes (Page ${currentPage} of ${totalPages})`}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Quote # & Status</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-4">Issue & Validity</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Loading quotations...
                    </td>
                  </tr>
                ) : paginatedQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No quotations match your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedQuotations.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-900/40 transition-colors"
                    >
                      {/* Quote # & Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-stone-900 dark:text-white">
                            {q.quotationNumber || q.number}
                          </span>
                          <StatusPill status={q.status} />
                        </div>
                        {q.status === 'converted' && (
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                            ✓ Converted to Subscription
                          </p>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900 dark:text-white">
                          {q.customerName}
                        </p>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-stone-400" />
                          {q.customerCompany || q.customerEmail}
                        </p>
                      </td>

                      {/* Staff */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-stone-800 dark:text-stone-200">
                          {q.salesStaffName || 'Sales Desk'}
                        </p>
                        <p className="text-[11px] text-stone-400">Regional AE</p>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <p className="text-stone-800 dark:text-stone-200">
                          {formatDate(q.quotationDate || q.issueDate)}
                        </p>
                        <p className="text-stone-400">
                          Exp: {formatDate(q.expiryDate || q.validUntil)}
                        </p>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3 px-4 text-right font-mono text-stone-700 dark:text-stone-300">
                        {formatCurrency(q.subtotal || q.amount, currency)}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 dark:text-white">
                        {formatCurrency(q.grandTotal || q.totalAmount, currency)}
                        <p className="text-[10px] font-normal text-stone-400">
                          +18% GST (₹{formatCurrency(q.totalTax || q.gstAmount, currency).replace('₹', '')})
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(q)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print / Save PDF */}
                          <button
                            type="button"
                            onClick={() => generateQuotationPdf(q)}
                            title="Print / Save PDF"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Convert to Subscription if Accepted */}
                          {q.status === 'accepted' && (
                            <Button
                              variant="primary"
                              size="xs"
                              icon={RefreshCw}
                              onClick={() => handleConvert(q)}
                            >
                              Convert
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

      {/* Form Modal */}
      <QuotationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={createQuotation}
        customers={customers}
        staff={staffList}
        products={products}
        currency={currency}
      />

      {/* Details Modal */}
      <QuotationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        quotation={selectedQuotation}
        onUpdateStatus={updateQuotationStatus}
        onConvertToSubscription={handleConvert}
        onPrintPdf={generateQuotationPdf}
        currency={currency}
      />
    </div>
  );
}
