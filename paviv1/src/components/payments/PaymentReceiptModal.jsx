import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import {
  CreditCard,
  Printer,
  Building,
  Calendar,
  Hash,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function PaymentReceiptModal({
  isOpen,
  onClose,
  payment,
  onPrintReceipt,
  onRefund,
  currency = 'INR',
}) {
  if (!payment) return null;

  const isSucceeded = payment.status === 'succeeded';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment Voucher ${payment.txnRef}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Settlement Amount Banner */}
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Amount Collected
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(payment.amount, currency)}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cleared via {payment.method} &bull; Gateway: {payment.gateway || 'Direct'}</span>
          </div>
        </div>

        {/* Transaction Metadata */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Transaction Reference:</span>
            <span className="font-mono font-bold text-foreground">{payment.txnRef}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Settlement Status:</span>
            <StatusPill status={payment.status} />
          </div>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Payer (Client):</span>
            <span className="font-semibold text-foreground">{payment.customerCompany || payment.customerName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Client GSTIN:</span>
            <span className="font-mono text-foreground">{payment.gstinRef || '33DEMO0001A1Z1'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Against Tax Invoice:</span>
            <span className="font-mono font-semibold text-primary">{payment.invoiceNumber || 'INV-2026-BL-SETTLEMENT'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Transaction Date & Time:</span>
            <span className="text-foreground">
              {payment.date ? new Date(payment.date).toLocaleString('en-IN') : formatDate(payment.date)}
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Audit Remarks:</span>
            <span className="text-foreground text-right">{payment.notes || 'Full settlement received'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
          {isSucceeded && onRefund ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const reason = prompt('Please enter refund reason:');
                if (reason) onRefund(payment.id, reason);
              }}
              className="gap-1.5 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Issue Refund
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => onPrintReceipt(payment)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Printer className="w-3.5 h-3.5" /> Print Payment Receipt
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
