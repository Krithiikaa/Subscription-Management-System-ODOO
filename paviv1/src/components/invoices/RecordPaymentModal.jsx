import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Hash,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
  currency = 'INR',
}) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'UPI AutoPay',
    gateway: 'Razorpay UPI AutoPay',
    txnRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: 'Settlement received and cleared via payment gateway',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen && invoice) {
      const generatedTxn = `TXN-IN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        amount: invoice.totalAmount || invoice.amount || '',
        paymentMethod: invoice.paymentMethod || 'UPI AutoPay',
        gateway: 'Razorpay UPI AutoPay',
        txnRef: generatedTxn,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: `Full payment settlement against ${invoice.invoiceNumber || invoice.number}`,
      });
      setFormError('');
      setSubmitting(false);
    }
  }, [isOpen, invoice]);

  if (!invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const amt = Number(formData.amount);
    if (!amt || amt <= 0) {
      setFormError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (!formData.txnRef.trim()) {
      setFormError('Transaction reference is required for audit reconciliation.');
      return;
    }

    setSubmitting(true);
    const res = await onRecordPayment(invoice.id, formData);
    setSubmitting(false);

    if (res?.success) {
      onClose();
    } else if (res?.error) {
      setFormError(res.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Settlement"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Invoice Summary Box */}
        <div className="p-4 bg-muted/30 border border-border/70 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Settling Invoice
            </span>
            <div className="font-mono font-bold text-base text-foreground mt-0.5">
              {invoice.invoiceNumber || invoice.number}
            </div>
            <div className="text-xs text-muted-foreground">
              {invoice.customerCompany || invoice.customerName}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Due Amount
            </span>
            <div className="font-mono font-bold text-lg text-primary mt-0.5">
              {formatCurrency(invoice.totalAmount, currency)}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Inc. 18% GST
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount Paid */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Settlement Amount (INR ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => {
                const method = e.target.value;
                let gateway = 'Razorpay UPI AutoPay';
                if (method.includes('NetBanking')) gateway = 'HDFC SmartHub / Axis PG';
                else if (method.includes('NEFT')) gateway = 'Direct Bank NEFT/RTGS';
                else if (method.includes('NACH')) gateway = 'NPCI AutoDebit';
                else if (method.includes('Card')) gateway = 'Razorpay Gateway';

                setFormData({
                  ...formData,
                  paymentMethod: method,
                  gateway,
                });
              }}
              className="w-full px-3 py-2 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="UPI AutoPay">UPI AutoPay (NPCI e-Mandate)</option>
              <option value="UPI (Google Pay / PhonePe)">UPI (PhonePe / GPay / Paytm)</option>
              <option value="HDFC NetBanking">HDFC Corporate NetBanking</option>
              <option value="ICICI NetBanking">ICICI Corporate NetBanking</option>
              <option value="SBI Corporate Banking">SBI Corporate Banking</option>
              <option value="NEFT / RTGS Transfer">NEFT / RTGS Direct Transfer</option>
              <option value="NACH Mandate">NACH Bank Mandate</option>
              <option value="Corporate RuPay Card">Corporate RuPay Card</option>
              <option value="Corporate Visa Card">Corporate Visa Card</option>
            </select>
          </div>

          {/* Gateway Provider */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-muted-foreground" /> Payment Gateway
            </label>
            <input
              type="text"
              value={formData.gateway}
              onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Razorpay, Cashfree, PayU"
            />
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Transaction / UTR Ref *
            </label>
            <input
              type="text"
              value={formData.txnRef}
              onChange={(e) => setFormData({ ...formData, txnRef: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="TXN-IN-2026-XXXX or UTR"
              required
            />
          </div>

          {/* Date of Payment */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Payment Date *
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Audit / Reconciliation Notes
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Bank confirmation voucher received"
          />
        </div>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Recording this settlement will automatically transition invoice status to <strong>PAID</strong> and generate a ledger voucher.</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Recording Settlement...' : 'Confirm & Mark Paid'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
