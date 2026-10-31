import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StatusPill } from '../common/StatusPill';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  FileCheck2,
  RefreshCw,
  Edit2,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  relations = { quotations: [], subscriptions: [], invoices: [], payments: [] },
  onEdit,
  onToggleStatus,
  currency = 'INR',
}) {
  const [activeTab, setActiveTab] = useState('subscriptions'); // subscriptions | quotations | invoices | payments

  if (!customer) return null;

  const { quotations = [], subscriptions = [], invoices = [], payments = [] } = relations;

  // Calculate quick metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
  const totalPaid = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="360° Customer Profile & Ledger"
      subtitle={`Complete account history and relational ledger for ${customer.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-lg font-serif border border-amber-500/20 shrink-0">
              {customer.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-serif">
                  {customer.name}
                </h3>
                <StatusPill status={customer.status} />
                <Badge variant="primary" size="sm">
                  {customer.segment || 'Enterprise'}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                {customer.company || 'Enterprise SaaS Client'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="xs"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(customer);
              }}
            >
              Edit Details
            </Button>
            <Button
              variant={customer.status === 'active' ? 'secondary' : 'primary'}
              size="xs"
              onClick={() => onToggleStatus(customer)}
            >
              {customer.status === 'active' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </div>

        {/* Contact & Business Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[11px] mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Email Address
            </p>
            <p className="font-semibold text-stone-900 dark:text-white truncate font-mono">
              {customer.email}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[11px] mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Phone Number
            </p>
            <p className="font-semibold text-stone-900 dark:text-white font-mono">
              {customer.phone || 'N/A'}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[11px] mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              GSTIN
            </p>
            <p className="font-semibold text-stone-900 dark:text-white font-mono uppercase">
              {customer.gstin || 'Unregistered'}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[11px] mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              Location
            </p>
            <p className="font-semibold text-stone-900 dark:text-white truncate">
              {customer.city ? `${customer.city}, ${customer.state || 'TN'}` : 'Tamil Nadu'}
            </p>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Active Subscriptions</p>
            <p className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-0.5">
              {subscriptions.filter((s) => s.status === 'active').length}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total Quotations</p>
            <p className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-0.5">
              {quotations.length}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total Invoiced</p>
            <p className="text-lg font-bold text-stone-900 dark:text-white font-serif mt-0.5">
              {formatCurrency(totalInvoiced, currency)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">Total Settled</p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-serif mt-0.5">
              {formatCurrency(totalPaid, currency)}
            </p>
          </div>
        </div>

        {/* Tab Navigation for 4 Relational Datasets */}
        <div>
          <div className="flex border-b border-stone-200 dark:border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className={`pb-2.5 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'subscriptions'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Subscriptions ({subscriptions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quotations')}
              className={`pb-2.5 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Quotations ({quotations.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`pb-2.5 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Invoices ({invoices.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`pb-2.5 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payments ({payments.length})
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="pt-4">
            {/* 1. Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-2">
                {subscriptions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    No subscriptions found for this customer account.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 dark:text-white">
                              {sub.planName || 'Recurring Plan'}
                            </span>
                            <StatusPill status={sub.status} />
                            <span className="text-[10px] font-mono text-stone-400 px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">
                              {sub.billingCycle}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Started {formatDate(sub.startDate)} &bull; Next billing: {formatDate(sub.nextBilling)}
                          </p>
                        </div>
                        <div className="text-right sm:shrink-0">
                          <p className="font-bold text-stone-900 dark:text-white font-mono text-sm">
                            {formatCurrency(sub.amount, currency)}
                            <span className="text-[11px] text-stone-400 font-normal"> /cycle</span>
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            {sub.autoRenew ? '✓ Auto-Renew Active' : 'Manual Renewal'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Quotations Tab */}
            {activeTab === 'quotations' && (
              <div className="space-y-2">
                {quotations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    No quotations generated for this customer yet.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
                    {quotations.map((q) => (
                      <div key={q.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 dark:text-white font-mono">
                              {q.number || q.id}
                            </span>
                            <StatusPill status={q.status} />
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Issued {formatDate(q.issueDate)} &bull; Valid until {formatDate(q.validUntil)}
                          </p>
                        </div>
                        <div className="text-right sm:shrink-0">
                          <p className="font-bold text-stone-900 dark:text-white font-mono text-sm">
                            {formatCurrency(q.totalAmount || q.amount, currency)}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            Incl. 18% GST ({formatCurrency(q.gstAmount, currency)})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-2">
                {invoices.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    No tax invoices on record for this customer.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 dark:text-white font-mono">
                              {inv.number || inv.id}
                            </span>
                            <StatusPill status={inv.status} />
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Issued {formatDate(inv.issueDate)} &bull; Due {formatDate(inv.dueDate)}
                            {inv.method && ` &bull; ${inv.method}`}
                          </p>
                        </div>
                        <div className="text-right sm:shrink-0">
                          <p className="font-bold text-stone-900 dark:text-white font-mono text-sm">
                            {formatCurrency(inv.totalAmount || inv.amount, currency)}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {inv.paidDate ? `Paid on ${formatDate(inv.paidDate)}` : 'Pending settlement'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-2">
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    No payment settlements recorded.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
                    {payments.map((p) => (
                      <div key={p.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 dark:text-white font-mono">
                              {p.txnRef || p.id}
                            </span>
                            <StatusPill status={p.status} />
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {formatDate(p.date)} &bull; {p.method} ({p.gateway})
                          </p>
                        </div>
                        <div className="text-right sm:shrink-0">
                          <p className="font-bold text-stone-900 dark:text-white font-mono text-sm">
                            {formatCurrency(p.amount, currency)}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            Ref: {p.invoiceId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}
