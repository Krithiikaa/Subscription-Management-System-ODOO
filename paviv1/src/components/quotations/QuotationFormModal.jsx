import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  FileText,
  User,
  Users,
  Calendar,
  Plus,
  Trash2,
  Percent,
  Receipt,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export function QuotationFormModal({
  isOpen,
  onClose,
  onSubmit,
  customers = [],
  staff = [],
  products = [],
  currency = 'INR',
}) {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerGstin: '',
    salesStaffId: '',
    salesStaffName: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Includes standard enterprise Tamil Nadu SaaS SLA and priority onboarding assistance.',
    termsAndConditions: '1. Quotation valid for 30 days from date of issue. 2. 18% GST (9% CGST + 9% SGST) applicable on all Indian SaaS software licenses. 3. Disputes subject to Chennai jurisdiction.',
    items: [],
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize line items
  useEffect(() => {
    if (isOpen) {
      const defaultCust = customers[0] || {};
      const defaultStaff = staff[0] || {};
      const defaultProd = products[0] || {};

      setFormData({
        customerId: defaultCust.id || '',
        customerName: defaultCust.name || 'Enterprise Customer',
        customerEmail: defaultCust.email || '',
        customerCompany: defaultCust.company || '',
        customerGstin: defaultCust.gstin || '',
        salesStaffId: defaultStaff.id || '',
        salesStaffName: defaultStaff.name || 'Sales Desk',
        quotationDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Includes standard enterprise Tamil Nadu SaaS SLA and priority onboarding assistance.',
        termsAndConditions: '1. Quotation valid for 30 days from date of issue. 2. 18% GST (9% CGST + 9% SGST) applicable on all Indian SaaS software licenses. 3. Disputes subject to Chennai jurisdiction.',
        items: [
          {
            id: `item-${Date.now()}-1`,
            productId: defaultProd.id || 'prod-bl-01',
            productName: defaultProd.name || 'Brightloop Core Subscription Engine',
            variantId: '',
            variantName: 'Standard Base License',
            quantity: 1,
            unitPrice: defaultProd.salesPrice || defaultProd.price || 29999,
            discountPercent: 0,
            lineTotal: defaultProd.salesPrice || defaultProd.price || 29999,
          },
        ],
      });
      setFormError('');
    }
  }, [isOpen, customers, staff, products]);

  // Handle Customer Select
  const handleCustomerChange = (custId) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerEmail: cust.email,
        customerCompany: cust.company,
        customerGstin: cust.gstin,
      }));
    }
  };

  // Handle Staff Select
  const handleStaffChange = (staffId) => {
    const s = staff.find((st) => st.id === staffId);
    if (s) {
      setFormData((prev) => ({
        ...prev,
        salesStaffId: s.id,
        salesStaffName: s.name,
      }));
    }
  };

  // Add Item
  const handleAddItem = () => {
    const defaultProd = products[0] || {};
    const newItem = {
      id: `item-${Date.now()}-${formData.items.length + 1}`,
      productId: defaultProd.id || '',
      productName: defaultProd.name || 'Add-on License Module',
      variantId: '',
      variantName: 'Standard',
      quantity: 1,
      unitPrice: defaultProd.salesPrice || defaultProd.price || 9999,
      discountPercent: 0,
      lineTotal: defaultProd.salesPrice || defaultProd.price || 9999,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      setFormError('At least one product line item is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Update Item Field
  const handleItemFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const it = { ...updatedItems[index], [field]: value };

      // If product changed, update unit price
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          it.productName = prod.name;
          it.unitPrice = prod.salesPrice || prod.price || 0;
        }
      }

      // Re-calculate line total
      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      const price = Math.max(0, parseFloat(it.unitPrice) || 0);
      const disc = Math.min(100, Math.max(0, parseFloat(it.discountPercent) || 0));
      it.lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100;

      updatedItems[index] = it;
      return { ...prev, items: updatedItems };
    });
  };

  // Live Totals
  const subtotal = formData.items.reduce((sum, it) => sum + (it.lineTotal || 0), 0);
  const cgst = Math.round(subtotal * 0.09 * 100) / 100;
  const sgst = Math.round(subtotal * 0.09 * 100) / 100;
  const totalTax = cgst + sgst;
  const grandTotal = Math.round((subtotal + totalTax) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.customerId) {
      setFormError('Please select a customer.');
      return;
    }

    if (formData.items.length === 0) {
      setFormError('Please add at least one product.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Sales Quotation"
      subtitle="Assemble an itemized sales estimate with 18% GST calculation (9% CGST + 9% SGST)"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* Customer & Staff Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Select Customer <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <select
                required
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.company || c.email} ({c.city || 'TN'})
                  </option>
                ))}
              </select>
            </div>
            {formData.customerCompany && (
              <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1 font-mono">
                <Building className="w-3 h-3 text-stone-400" />
                GSTIN: {formData.customerGstin || 'Unregistered'} &bull; {formData.customerEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Sales Staff Representative
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <select
                value={formData.salesStaffId}
                onChange={(e) => handleStaffChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.department} &bull; {s.office})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quotation & Expiry Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Quotation Date
            </label>
            <input
              type="date"
              required
              value={formData.quotationDate}
              onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Expiry Date (Validity)
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Multi-Line Items Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Itemized Products & Licenses
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={handleAddItem}
            >
              Add Line Item
            </Button>
          </div>

          <div className="space-y-2.5">
            {formData.items.map((it, idx) => (
              <div
                key={it.id || idx}
                className="p-3 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs"
              >
                {/* Product Select */}
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">Product</label>
                  <select
                    value={it.productId}
                    onChange={(e) => handleItemFieldChange(idx, 'productId', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.salesPrice || p.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant or Entitlement */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">Variant / Tier</label>
                  <input
                    type="text"
                    value={it.variantName}
                    onChange={(e) => handleItemFieldChange(idx, 'variantName', e.target.value)}
                    placeholder="Standard"
                    className="w-full px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={it.unitPrice}
                    onChange={(e) => handleItemFieldChange(idx, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Quantity */}
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Discount % */}
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">Disc%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={it.discountPercent}
                    onChange={(e) => handleItemFieldChange(idx, 'discountPercent', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Remove button */}
                <div className="sm:col-span-1 flex items-center justify-end pb-0.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    title="Remove item"
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST & Totals Summary Box */}
        <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-stone-500 text-[11px]">
            <p><strong>Place of Supply:</strong> Tamil Nadu (State Code: 33)</p>
            <p><strong>GST Applicable:</strong> Central GST 9.0% + State GST 9.0% = 18.0%</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-right font-mono">
            <div className="flex justify-between">
              <span className="text-stone-500">Taxable Subtotal:</span>
              <span className="font-semibold text-stone-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>CGST (9%):</span>
              <span>{formatCurrency(cgst, currency)}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>SGST (9%):</span>
              <span>{formatCurrency(sgst, currency)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-amber-300 dark:border-amber-800 text-sm font-bold text-amber-900 dark:text-amber-300">
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Internal Notes / Scope
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Standard Terms & Conditions
            </label>
            <textarea
              rows={2}
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Generating Quotation...' : 'Create Sales Quotation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
