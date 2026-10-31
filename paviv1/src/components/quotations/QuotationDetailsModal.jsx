import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { Badge } from '../common/Badge';
import {
  FileText,
  User,
  Users,
  Building,
  Calendar,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Printer,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function QuotationDetailsModal({
  isOpen,
  onClose,
  quotation,
  onUpdateStatus,
  onConvertToSubscription,
  onPrintPdf,
  currency = 'INR',
}) {
  if (!quotation) return null;

  const isConverted = quotation.status === 'converted' || !!quotation.convertedSubscriptionId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sales Quotation & CPQ Specifications"
      subtitle={`Quotation ${quotation.quotationNumber || quotation.number} issued to ${quotation.customerName}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                {quotation.quotationNumber || quotation.number}
              </span>
              <StatusPill status={quotation.status} />
              {isConverted && (
                <Badge variant="primary" size="sm">
                  Converted to Subscription
                </Badge>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Issued {formatDate(quotation.quotationDate || quotation.issueDate)} &bull; Valid Until{' '}
              {formatDate(quotation.expiryDate || quotation.validUntil)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              icon={Printer}
              onClick={() => onPrintPdf(quotation)}
            >
              Print / Save PDF
            </Button>

            {/* Workflow Action Transitions */}
            {quotation.status === 'draft' && (
              <Button
                variant="primary"
                size="xs"
                icon={Send}
                onClick={() => onUpdateStatus(quotation.id, 'sent')}
              >
                Send to Customer
              </Button>
            )}

            {quotation.status === 'sent' && (
              <>
                <Button
                  variant="primary"
                  size="xs"
                  icon={CheckCircle2}
                  onClick={() => onUpdateStatus(quotation.id, 'accepted')}
                >
                  Mark as Accepted
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  icon={XCircle}
                  onClick={() => onUpdateStatus(quotation.id, 'declined')}
                >
                  Mark Declined
                </Button>
              </>
            )}

            {quotation.status === 'accepted' && (
              <Button
                variant="primary"
                size="xs"
                icon={RefreshCw}
                onClick={() => {
                  onClose();
                  onConvertToSubscription(quotation);
                }}
              >
                Convert to Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Billed To & Sales Representative Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-1">
            <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
              Customer & Entity:
            </p>
            <p className="font-semibold text-stone-900 dark:text-white text-sm">
              {quotation.customerName}
            </p>
            <p className="text-stone-500 dark:text-stone-400">{quotation.customerCompany || 'Enterprise SaaS Client'}</p>
            <p className="font-mono text-stone-500 dark:text-stone-400">{quotation.customerEmail}</p>
            <p className="font-mono text-[11px] text-stone-400">
              GSTIN: {quotation.customerGstin || '33DEMO0001A1Z1'}
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-1">
            <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
              Sales Representative:
            </p>
            <p className="font-semibold text-stone-900 dark:text-white text-sm">
              {quotation.salesStaffName || 'Praveen Shankar'}
            </p>
            <p className="text-stone-500 dark:text-stone-400">Brightloop Regional Enterprise Sales Desk</p>
            <p className="text-stone-500 dark:text-stone-400">Place of Supply: Tamil Nadu (Code 33)</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Tax Rule: 18% GST (9% CGST + 9% SGST)
            </p>
          </div>
        </div>

        {/* Itemized Breakdown Table */}
        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-2.5 px-4">Item & Variant</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
                <th className="py-2.5 px-4 text-right">Qty</th>
                <th className="py-2.5 px-4 text-right">Disc %</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {(quotation.items || []).map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-stone-900 dark:text-white">{it.productName}</p>
                    {it.variantName && (
                      <p className="text-[11px] text-stone-400">{it.variantName}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(it.unitPrice, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{it.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono">{it.discountPercent}%</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-stone-900 dark:text-white">
                    {formatCurrency(it.lineTotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals Ledger */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex-1 space-y-1">
            <p className="font-semibold text-stone-800 dark:text-stone-200">Notes & Terms:</p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px]">{quotation.notes || 'No special notes.'}</p>
            <p className="text-stone-400 text-[10px] pt-1">{quotation.termsAndConditions || ''}</p>
          </div>

          <div className="w-full sm:w-72 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 font-mono">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal:</span>
              <span>{formatCurrency(quotation.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>CGST (9.0%):</span>
              <span>{formatCurrency(quotation.cgstAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>SGST (9.0%):</span>
              <span>{formatCurrency(quotation.sgstAmount, currency)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-stone-200 dark:border-stone-800 text-sm font-bold text-amber-900 dark:text-amber-300">
              <span>Grand Total:</span>
              <span>{formatCurrency(quotation.grandTotal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Specifications
          </Button>
        </div>
      </div>
    </Modal>
  );
}
