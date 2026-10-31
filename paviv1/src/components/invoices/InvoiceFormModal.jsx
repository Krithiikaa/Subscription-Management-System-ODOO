import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  FileText,
  User,
  Calendar,
  Plus,
  Trash2,
  Percent,
  Receipt,
  AlertCircle,
  Building,
  CreditCard,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  customers = [],
  subscriptions = [],
  products = [],
  currency = 'INR',
}) {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerGstin: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    subscriptionId: '',
    subscriptionNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'UPI AutoPay (Scheduled)',
    notes: 'Recurring SaaS Billing under HSN/SAC Code 997331. Monthly Cloud Platform usage.',
    terms: '1. Goods/Services once sold are governed by Brightloop SaaS Terms of Service. 2. 18% GST (9% CGST + 9% SGST) applied under SAC Code 997331. 3. Disputes subject to Chennai jurisdiction.',
    items: [],
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      const defaultCust = customers[0] || {};
      const defaultProd = products[0] || {};

      setFormData({
        customerId: defaultCust.id || '',
        customerName: defaultCust.name || 'Enterprise Customer',
        customerEmail: defaultCust.email || '',
        customerCompany: defaultCust.company || '',
        customerGstin: defaultCust.gstin || '33DEMO0001A1Z1',
        customerPhone: defaultCust.phone || '+91 98400 11001',
        customerAddress: defaultCust.address || '42, Dr. Radhakrishnan Salai',
        customerCity: defaultCust.city || 'Chennai',
        subscriptionId: '',
        subscriptionNumber: 'On-Demand / Direct',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        paymentMethod: 'UPI AutoPay (Scheduled)',
        notes: 'Recurring SaaS Billing under HSN/SAC Code 997331. Monthly Cloud Platform usage.',
        terms: '1. Goods/Services once sold are governed by Brightloop SaaS Terms of Service. 2. 18% GST (9% CGST + 9% SGST) applied under SAC Code 997331. 3. Disputes subject to Chennai jurisdiction.',
        items: [
          {
            id: 'line-1',
            productName: defaultProd.name || 'Brightloop Core Subscription Engine',
            sacCode: '997331',
            quantity: 1,
            unitPrice: defaultProd.price || 29999,
            discountPercent: 0,
            lineTotal: defaultProd.price || 29999,
          },
        ],
      });
      setFormError('');
      setSubmitting(false);
    }
  }, [isOpen, customers, products]);

  // Handle Customer Selection
  const handleCustomerChange = (customerId) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    // Also check if customer has an active subscription
    const custSub = subscriptions.find((s) => s.customerId === cust.id);

    setFormData((prev) => ({
      ...prev,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerCompany: cust.company || '',
      customerGstin: cust.gstin || '33DEMO9999A1Z9',
      customerPhone: cust.phone || '',
      customerAddress: cust.address || '',
      customerCity: cust.city || 'Chennai',
      subscriptionId: custSub ? custSub.id : '',
      subscriptionNumber: custSub ? custSub.subscriptionNumber : 'Direct One-Off',
    }));
  };

  // Add Line Item
  const handleAddItem = () => {
    const defaultProd = products[0] || {};
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `line-${Date.now()}`,
          productName: defaultProd.name || 'Cloud Platform License',
          sacCode: '997331',
          quantity: 1,
          unitPrice: defaultProd.price || 14999,
          discountPercent: 0,
          lineTotal: defaultProd.price || 14999,
        },
      ],
    }));
  };

  // Remove Line Item
  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      setFormError('At least one line item is required on an invoice.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Update Line Item
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      const item = { ...nextItems[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        const disc = Number(item.discountPercent) || 0;
        const discounted = price - (price * disc) / 100;
        item.lineTotal = Math.max(0, Math.round(qty * discounted * 100) / 100);
      }

      nextItems[index] = item;
      return { ...prev, items: nextItems };
    });
  };

  // Calculations
  const subtotal = formData.items.reduce((acc, it) => acc + (Number(it.lineTotal) || 0), 0);
  const cgstAmount = Math.round((subtotal * 0.09) * 100) / 100;
  const sgstAmount = Math.round((subtotal * 0.09) * 100) / 100;
  const totalTax = cgstAmount + sgstAmount;
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.customerId) {
      setFormError('Please select a customer.');
      return;
    }

    if (!formData.dueDate) {
      setFormError('Please specify the payment due date.');
      return;
    }

    if (formData.items.length === 0) {
      setFormError('Invoice must contain at least one line item.');
      return;
    }

    setSubmitting(true);
    const res = await onSubmit(formData);
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
      title="Create Indian GST Tax Invoice"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* GST Notice Banner */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <span className="font-bold uppercase tracking-wider">Form GST INV-1 Compliance:</span> Standard 18% GST (9% CGST + 9% SGST) is computed under SAC Code 997331 for IT SaaS software services. Supplier GSTIN: <strong>33AABCB1234F1Z9</strong> (Tamil Nadu).
          </div>
        </div>

        {/* Section 1: Customer & Subscription */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Customer Account *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''} - {c.city || 'TN'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Linked Subscription (Optional)
            </label>
            <select
              value={formData.subscriptionId}
              onChange={(e) => {
                const sub = subscriptions.find((s) => s.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  subscriptionId: e.target.value,
                  subscriptionNumber: sub ? sub.subscriptionNumber : 'Direct One-Off',
                }));
              }}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">None / On-Demand Service</option>
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subscriptionNumber || s.id} - {s.customerName} ({s.planName || s.billingCycle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-muted-foreground" /> Customer GSTIN
            </label>
            <input
              type="text"
              value={formData.customerGstin}
              onChange={(e) => setFormData({ ...formData, customerGstin: e.target.value.toUpperCase() })}
              placeholder="33DEMO0001A1Z1"
              className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> Payment Collection Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="UPI AutoPay">UPI AutoPay (NPCI e-Mandate)</option>
              <option value="HDFC NetBanking">HDFC Corporate NetBanking</option>
              <option value="ICICI NetBanking">ICICI Corporate NetBanking</option>
              <option value="SBI Corporate Banking">SBI Corporate Banking</option>
              <option value="NEFT / RTGS Transfer">NEFT / RTGS Direct Transfer</option>
              <option value="NACH Mandate">NACH Bank Mandate</option>
              <option value="Corporate RuPay Card">Corporate RuPay Card</option>
              <option value="Corporate Visa Card">Corporate Visa Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Invoice Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Payment Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
        </div>

        {/* Section 2: Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" /> Invoice Line Items & SAC 997331
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="gap-1.5 text-xs rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service Line
            </Button>
          </div>

          <div className="space-y-2.5">
            {formData.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-card border border-border/70 rounded-xl grid grid-cols-12 gap-2.5 items-center"
              >
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    Service / Product
                  </label>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                    placeholder="SaaS License / Module"
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    SAC Code
                  </label>
                  <input
                    type="text"
                    value={item.sacCode}
                    onChange={(e) => handleItemChange(idx, 'sacCode', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="col-span-4 sm:col-span-1">
                  <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-right bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-right bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="col-span-4 sm:col-span-1">
                  <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    Disc %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discountPercent}
                    onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-right bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="col-span-6 sm:col-span-1 text-right">
                  <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                    Taxable
                  </label>
                  <span className="text-xs font-bold text-foreground block pt-1.5 font-mono">
                    ₹{Number(item.lineTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 text-right pt-4 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Tax Calculation Card */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm bg-muted/30 border border-border/80 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Taxable Value (Subtotal):</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>CGST (Central Tax @ 9.0%):</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(cgstAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>SGST (State Tax @ 9.0%):</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(sgstAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-primary">
              <span>Total GST (18.0%):</span>
              <span className="font-mono">
                {formatCurrency(totalTax, currency)}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
              <span>Grand Total (INR):</span>
              <span className="font-mono text-base text-primary">
                {formatCurrency(grandTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Initial Status & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Initial Invoice Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="pending">Pending (Issued to Client)</option>
              <option value="draft">Draft (Under Internal Review)</option>
              <option value="paid">Paid (Payment Already Settled)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Internal Notes / Remittance Reference
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="PO Ref, Billing Cycle, or Custom Note"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2">
            <FileText className="w-4 h-4" />
            {submitting ? 'Generating Invoice...' : 'Generate Tax Invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
