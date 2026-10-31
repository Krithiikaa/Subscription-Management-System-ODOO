import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/utils';
import { CreditCard, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

const BILLING_CYCLES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export function PlanFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialPlan = null,
  availableProducts = [],
  currency = 'INR',
}) {
  const isEditing = Boolean(initialPlan);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [productId, setProductId] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [price, setPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('1');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [closeAtEndOfPeriod, setCloseAtEndOfPeriod] = useState(true);
  const [allowEarlyClosure, setAllowEarlyClosure] = useState(false);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setName(initialPlan.name || '');
      setCode(initialPlan.code || '');
      setProductId(initialPlan.productId || initialPlan.product_id || '');
      setBillingCycle(
        initialPlan.billingCycle
          ? initialPlan.billingCycle.charAt(0).toUpperCase() + initialPlan.billingCycle.slice(1).toLowerCase()
          : 'Monthly'
      );
      setPrice(initialPlan.price?.toString() || '0');
      setMinQuantity(initialPlan.minQuantity?.toString() || '1');
      setAvailableFrom(initialPlan.availableFrom || '');
      setAvailableUntil(initialPlan.availableUntil || '');
      setCloseAtEndOfPeriod(initialPlan.closeAtEndOfPeriod ?? true);
      setAllowEarlyClosure(initialPlan.allowEarlyClosure ?? false);
      setAllowPause(initialPlan.allowPause ?? true);
      setAllowRenewal(initialPlan.allowRenewal ?? true);
      setStatus(initialPlan.status || 'active');
      setDescription(initialPlan.description || '');
    } else {
      setName('');
      setCode('');
      setProductId(availableProducts[0]?.id || '');
      setBillingCycle('Monthly');
      setPrice('');
      setMinQuantity('1');
      setAvailableFrom('');
      setAvailableUntil('');
      setCloseAtEndOfPeriod(true);
      setAllowEarlyClosure(false);
      setAllowPause(true);
      setAllowRenewal(true);
      setStatus('active');
      setDescription('');
    }
    setErrorMsg('');
  }, [initialPlan, isOpen, availableProducts]);

  // When selecting a linked product in create mode, optionally suggest its base price
  const handleProductSelect = (id) => {
    setProductId(id);
    if (!isEditing && !price) {
      const selected = availableProducts.find((p) => p.id === id);
      if (selected && selected.salesPrice) {
        setPrice(selected.salesPrice.toString());
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Plan name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    const numMinQty = parseInt(minQuantity, 10);

    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Plan price must be a valid positive number.');
      return;
    }
    if (isNaN(numMinQty) || numMinQty < 1) {
      setErrorMsg('Minimum quantity must be at least 1.');
      return;
    }

    if (availableFrom && availableUntil && new Date(availableUntil) < new Date(availableFrom)) {
      setErrorMsg('Available Until date cannot be earlier than Available From date.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        code: code.trim(),
        productId: productId || null,
        billingCycle,
        price: numPrice,
        minQuantity: numMinQty,
        availableFrom: availableFrom || null,
        availableUntil: availableUntil || null,
        closeAtEndOfPeriod,
        allowEarlyClosure,
        allowPause,
        allowRenewal,
        status,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save plan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
      subtitle={
        isEditing
          ? `Modify billing frequencies, pricing rules, and lifecycle policies for ${initialPlan?.name}`
          : 'Define a recurring subscription plan with linked product and billing schedule'
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Basic Plan Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kongu SME Cloud Starter"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Plan Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. PLN-KONGU-M"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Linked Product & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Linked Product
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- No Linked Product (Standalone) --</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.salesPrice, currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Lifecycle Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="active">Active (Available for subscription)</option>
              <option value="archived">Archived (Closed to new signups)</option>
            </select>
          </div>
        </div>

        {/* Billing Cycle Selection & Plan Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Billing Cycle <span className="text-rose-500">*</span>
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle} Cycle
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Plan Price (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="7500"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-bold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Minimum Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Date Limits: Available From / Available Until */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Available From (Optional)
            </label>
            <input
              type="date"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Available Until (Optional)
            </label>
            <input
              type="date"
              value={availableUntil}
              onChange={(e) => setAvailableUntil(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Subscription Policies & Closure Rules */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <h4 className="text-xs font-bold text-stone-900 dark:text-white mb-2">
            Subscription Policies & Lifecycle Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors">
              <input
                type="checkbox"
                checked={closeAtEndOfPeriod}
                onChange={(e) => setCloseAtEndOfPeriod(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-stone-300"
              />
              <span className="text-stone-800 dark:text-stone-200 font-medium">
                Close at end of billing period
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors">
              <input
                type="checkbox"
                checked={allowEarlyClosure}
                onChange={(e) => setAllowEarlyClosure(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-stone-300"
              />
              <span className="text-stone-800 dark:text-stone-200 font-medium">
                Allow early cancellation / closure
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors">
              <input
                type="checkbox"
                checked={allowPause}
                onChange={(e) => setAllowPause(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-stone-300"
              />
              <span className="text-stone-800 dark:text-stone-200 font-medium">
                Allow temporary pause
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors">
              <input
                type="checkbox"
                checked={allowRenewal}
                onChange={(e) => setAllowRenewal(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-stone-300"
              />
              <span className="text-stone-800 dark:text-stone-200 font-medium">
                Allow recurring auto-renewal
              </span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Plan Description
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Plan features, quota allowances, and renewal conditions..."
            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
