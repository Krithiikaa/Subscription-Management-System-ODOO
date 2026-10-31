import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import {
  FileText,
  Printer,
  CreditCard,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Layers,
  ArrowRight,
  Clock,
  Ban,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
  onDownloadPdf,
  onOpenRecordPayment,
  onUpdateStatus,
  currency = 'INR',
}) {
  if (!invoice) return null;

  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  const isDraft = invoice.status === 'draft';
  const isPending = invoice.status === 'pending';

  // Calculate days overdue if due_date is in past
  const dueTime = new Date(invoice.dueDate).getTime();
  const nowTime = Date.now();
  const daysDiff = Math.ceil((nowTime - dueTime) / (1000 * 60 * 60 * 24));
  const isPastDue = (isOverdue || isPending) && daysDiff > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice ${invoice.invoiceNumber || invoice.number}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Status Alert Banner */}
        {isPaid ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm">Payment Received & Fully Settled</span>
                <p className="text-xs opacity-90">
                  Settled on {invoice.paidDate ? formatDate(invoice.paidDate) : 'Confirmed'} via {invoice.paymentMethod || 'Payment Gateway'}
                </p>
              </div>
            </div>
            <StatusPill status="paid" />
          </div>
        ) : isPastDue ? (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-red-800 dark:text-red-300">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm">Payment Overdue by {daysDiff} Days</span>
                <p className="text-xs opacity-90">
                  Original Due Date was {formatDate(invoice.dueDate)}. Automated dunning notices queued.
                </p>
              </div>
            </div>
            <StatusPill status="overdue" />
          </div>
        ) : (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm">Awaiting Payment Settlement</span>
                <p className="text-xs opacity-90">
                  Payment due on or before {formatDate(invoice.dueDate)} ({invoice.paymentMethod || 'Awaiting Clearance'})
                </p>
              </div>
            </div>
            <StatusPill status={invoice.status} />
          </div>
        )}

        {/* Supplier & Recipient Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/20 border border-border/70 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Billed Recipient (Client)
            </span>
            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-primary" />
              {invoice.customerCompany || invoice.customerName}
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Attn: {invoice.customerName}</p>
              <p>{invoice.customerEmail}</p>
              <p>{invoice.customerPhone || '+91 98400 11000'}</p>
              <p className="font-mono text-[11px] text-foreground font-semibold">
                GSTIN: {invoice.customerGstin || '33DEMO0001A1Z1'}
              </p>
              <p>Place of Supply: {invoice.customerState || 'Tamil Nadu'} (Code 33)</p>
            </div>
          </div>

          <div className="p-4 bg-muted/20 border border-border/70 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Billing & Subscription Reference
            </span>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div className="flex justify-between">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-foreground">{invoice.invoiceNumber || invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span>Issue Date:</span>
                <span className="font-medium text-foreground">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Due Date:</span>
                <span className="font-medium text-foreground">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Linked Subscription:</span>
                <span className="font-medium text-primary flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {invoice.subscriptionNumber || 'Direct / On-Demand'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium text-foreground">{invoice.paymentMethod || 'UPI AutoPay'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-primary" /> Itemized Charges (SAC Code 997331)
          </h4>
          <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/70">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Service Description</th>
                  <th className="py-2.5 px-3">SAC</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Disc %</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(invoice.items && invoice.items.length > 0 ? invoice.items : [
                  {
                    productName: invoice.planName || 'Enterprise SaaS Platform License',
                    sacCode: '997331',
                    quantity: 1,
                    unitPrice: invoice.subtotal || invoice.amount || 29999,
                    discountPercent: 0,
                    lineTotal: invoice.subtotal || invoice.amount || 29999,
                  }
                ]).map((it, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {it.productName}
                      <span className="block text-[10px] text-muted-foreground">Digital software service license access</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{it.sacCode || '997331'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{it.quantity || 1}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.unitPrice, currency)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{it.discountPercent || 0}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(it.lineTotal, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Computation Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm bg-muted/30 border border-border/80 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Taxable Value (Subtotal):</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(invoice.subtotal || invoice.amount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Central GST (CGST @ 9.0%):</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(invoice.cgstAmount || (invoice.gstAmount ? invoice.gstAmount / 2 : 0), currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>State GST (SGST @ 9.0%):</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(invoice.sgstAmount || (invoice.gstAmount ? invoice.gstAmount / 2 : 0), currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-primary">
              <span>Total GST (18.0%):</span>
              <span className="font-mono">
                {formatCurrency(invoice.totalTax || invoice.gstAmount, currency)}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
              <span>Grand Total (INR):</span>
              <span className="font-mono text-base text-primary">
                {formatCurrency(invoice.totalAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(invoice.id, 'pending')}
                className="gap-1.5 text-xs text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Dispatch / Mark Sent
              </Button>
            )}
            {!isPaid && invoice.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(invoice.id, 'cancelled')}
                className="gap-1.5 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
              >
                <Ban className="w-3.5 h-3.5" /> Cancel Invoice
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadPdf(invoice)}
              className="gap-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-500" /> Print Tax Invoice (PDF)
            </Button>

            {!isPaid && invoice.status !== 'cancelled' && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenRecordPayment(invoice);
                }}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CreditCard className="w-3.5 h-3.5" /> Record Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
