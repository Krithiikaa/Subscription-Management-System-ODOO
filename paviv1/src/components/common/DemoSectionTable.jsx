import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { StatusPill } from './StatusPill';
import { Button } from './Button';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';

export function DemoSectionTable({
  sectionKey,
  title,
  subtitle,
  data = [],
  currency = 'INR',
  onSwitchToLive,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract available statuses for filter dropdown
  const statusOptions = useMemo(() => {
    const statuses = new Set();
    data.forEach((item) => {
      if (item.status) statuses.add(item.status);
      if (item.category) statuses.add(item.category);
      if (item.segment) statuses.add(item.segment);
    });
    return Array.from(statuses);
  }, [data]);

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    let result = data;

    if (statusFilter !== 'ALL') {
      result = result.filter(
        (item) =>
          item.status === statusFilter ||
          item.category === statusFilter ||
          item.segment === statusFilter
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q)
        )
      );
    }

    return result;
  }, [data, searchTerm, statusFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  // Export current filtered dataset to CSV
  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightloop_demo_${sectionKey}_${filteredData.length}_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Demo Notice Banner with exact count and synthetic disclosure */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                  Demo Mode Active: {title} ({data.length} Realistic Records)
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-200/80 dark:bg-amber-800/70 text-amber-900 dark:text-amber-200 font-mono">
                  Tamil Nadu &bull; ₹ INR
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                Notice: All GSTINs (<span className="font-mono text-amber-800 dark:text-amber-300">33DEMO...</span>) and phone numbers (<span className="font-mono text-amber-800 dark:text-amber-300">+91 98400...</span>) are synthetic demo identifiers. Live Supabase database is 100% untouched.
              </p>
            </div>
          </div>

          {onSwitchToLive && (
            <button
              onClick={onSwitchToLive}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0 shadow-2xs"
            >
              Switch to Live DB Mode
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="flex flex-col">
        <CardHeader
          title={title}
          subtitle={subtitle || `Displaying ${filteredData.length} of ${data.length} records`}
          action={
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
            >
              Export CSV ({filteredData.length})
            </Button>
          }
        />

        {/* Filter and Search Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="ALL">All Categories & Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0 overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No records match your filter</p>
              <p className="text-xs mt-1">Try resetting the search bar or category selector</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {sectionKey === 'customers' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Customer & Company</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Synthetic GSTIN</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Segment</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                  {sectionKey === 'staff' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Staff Member</th>
                      <th className="py-3 px-4">Role Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Office Location</th>
                      <th className="py-3 px-4">Official Phone</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                  {sectionKey === 'products' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Product Code & Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Base Pricing</th>
                      <th className="py-3 px-4">Billing Model</th>
                      <th className="py-3 px-4">Description</th>
                    </>
                  )}
                  {sectionKey === 'plans' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Plan Code & Tier</th>
                      <th className="py-3 px-4">Billing Cycle</th>
                      <th className="py-3 px-4">Recurring Price</th>
                      <th className="py-3 px-4">Trial Days</th>
                      <th className="py-3 px-4">Max Users</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                  {sectionKey === 'quotations' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Quotation #</th>
                      <th className="py-3 px-4">Customer ID</th>
                      <th className="py-3 px-4">Account Executive</th>
                      <th className="py-3 px-4">Product ID</th>
                      <th className="py-3 px-4">Total (Incl. 18% GST)</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                  {sectionKey === 'subscriptions' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Subscription ID</th>
                      <th className="py-3 px-4">Customer Ref</th>
                      <th className="py-3 px-4">Plan Name</th>
                      <th className="py-3 px-4">Recurring Amount</th>
                      <th className="py-3 px-4">Cycle</th>
                      <th className="py-3 px-4">Next Billing Date</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                  {sectionKey === 'invoices' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Invoice #</th>
                      <th className="py-3 px-4">Customer / Account</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">GST Included</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                  {sectionKey === 'payments' && (
                    <>
                      <th className="py-3 px-4 sm:px-6">Transaction Ref</th>
                      <th className="py-3 px-4">Invoice Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Gateway</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    {sectionKey === 'customers' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs ${item.avatarColor}`}
                            >
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                {item.company} &bull; {item.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300">
                          {item.city}, {item.state}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-amber-800 dark:text-amber-400">
                          {item.gstin}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {item.phone}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {item.segment}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                          {formatDate(item.joinedDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}

                    {sectionKey === 'staff' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-stone-800 dark:text-stone-200">
                          {item.role}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {item.department}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 font-medium">
                          {item.office} ({item.city})
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                          {item.phone}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}

                    {sectionKey === 'products' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6">
                          <p className="font-semibold text-stone-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
                            {item.code}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          {formatCurrency(item.price, currency)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 capitalize">
                          {item.billingType}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 text-[11px] max-w-xs truncate">
                          {item.description}
                        </td>
                      </>
                    )}

                    {sectionKey === 'plans' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6">
                          <p className="font-semibold text-stone-900 dark:text-white">{item.name}</p>
                          <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
                            {item.code}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-stone-800 dark:text-stone-200">
                          {item.billingCycle}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          {formatCurrency(item.price, currency)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {item.trialDays} days
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {item.maxUsers} seats
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}

                    {sectionKey === 'quotations' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-amber-800 dark:text-amber-400">
                          {item.number}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {item.customerId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {item.staffId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {item.productId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          {formatCurrency(item.totalAmount, currency)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                          {formatDate(item.issueDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}

                    {sectionKey === 'subscriptions' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-stone-900 dark:text-amber-400">
                          {item.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {item.customerId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">
                          {item.planName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          {formatCurrency(item.amount, currency)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {item.billingCycle}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                          {formatDate(item.nextBilling)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}

                    {sectionKey === 'invoices' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-amber-800 dark:text-amber-400">
                          {item.number}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-stone-900 dark:text-white truncate">
                            {item.customerName}
                          </p>
                          <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
                            {item.customerId}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          {formatCurrency(item.totalAmount, currency)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-500 dark:text-stone-400">
                          {formatCurrency(item.gstAmount, currency)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                          {formatDate(item.dueDate)}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-stone-500 dark:text-stone-400">
                          {item.method}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}

                    {sectionKey === 'payments' && (
                      <>
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-amber-800 dark:text-amber-400">
                          {item.txnRef}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {item.invoiceId}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-stone-900 dark:text-white">
                          {item.customerName || item.customerId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          {formatCurrency(item.amount, currency)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                          {item.gateway} ({item.method})
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={item.status} />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {filteredData.length > pageSize && (
          <CardFooter className="flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{' '}
              records
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
    </div>
  );
}
