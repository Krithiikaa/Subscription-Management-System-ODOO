import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/utils';
import { Plus, Trash2, IndianRupee, Layers, Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Core Engine',
  'Compliance',
  'Payments',
  'Recovery',
  'Infrastructure',
  'Analytics',
  'Billing',
  'Metering',
  'Portals',
  'Security',
  'Integration',
  'Finance',
  'Support',
  'Add-ons',
  'General',
];

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null,
  currency = 'INR',
}) {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Core Engine');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [variants, setVariants] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setCode(initialProduct.code || '');
      setCategory(initialProduct.category || 'Core Engine');
      setSalesPrice(initialProduct.salesPrice?.toString() || '0');
      setCostPrice(initialProduct.costPrice?.toString() || '0');
      setDescription(initialProduct.description || '');
      setStatus(initialProduct.status || 'active');
      setVariants(
        (initialProduct.variants || []).map((v) => ({
          name: v.name || '',
          additionalPrice: v.additionalPrice?.toString() || '0',
          sku: v.sku || '',
        }))
      );
    } else {
      setName('');
      setCode('');
      setCategory('Core Engine');
      setSalesPrice('');
      setCostPrice('');
      setDescription('');
      setStatus('active');
      setVariants([]);
    }
    setErrorMsg('');
  }, [initialProduct, isOpen]);

  // Add empty variant
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: '', additionalPrice: '560', sku: '' },
    ]);
  };

  // Remove variant
  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Update variant field
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    const numSalesPrice = parseFloat(salesPrice);
    const numCostPrice = parseFloat(costPrice || '0');

    if (isNaN(numSalesPrice) || numSalesPrice < 0) {
      setErrorMsg('Sales price must be a valid positive number.');
      return;
    }
    if (isNaN(numCostPrice) || numCostPrice < 0) {
      setErrorMsg('Cost price must be a valid positive number.');
      return;
    }

    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].name.trim()) {
        setErrorMsg(`Variant #${i + 1} requires a name.`);
        return;
      }
      const addPrice = parseFloat(variants[i].additionalPrice || '0');
      if (isNaN(addPrice) || addPrice < 0) {
        setErrorMsg(`Variant #${i + 1} additional price cannot be negative.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        code: code.trim(),
        category,
        salesPrice: numSalesPrice,
        costPrice: numCostPrice,
        description: description.trim(),
        status,
        variants: variants.map((v) => ({
          name: v.name.trim(),
          additionalPrice: parseFloat(v.additionalPrice || '0'),
          sku: v.sku.trim(),
        })),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedBasePrice = parseFloat(salesPrice) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      subtitle={
        isEditing
          ? `Modify product attributes, pricing, and variants for ${initialProduct?.name}`
          : 'Define a new software subscription product or billing module'
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

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brightloop Core Subscription Engine"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Product Code / SKU
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. PRD-CORE-01"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Category / Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              <option value="active">Active (Available for contracts)</option>
              <option value="archived">Archived (Retired / Inactive)</option>
            </select>
          </div>
        </div>

        {/* Pricing: Sales Price & Cost Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Base Sales Price (₹ INR) <span className="text-rose-500">*</span>
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
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                placeholder="29999"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-semibold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Cost Price (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="12000"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-semibold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Description / Specifications
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed features, customer quota limits, and billing terms..."
            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {/* Product Variants Section */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Product Variants & Add-ons ({variants.length})
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Support multiple variants with additional pricing (e.g. Odoo Brand – additional ₹560)
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={handleAddVariant}
            >
              Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-stone-400 text-xs">
              No variants defined. Click "Add Variant" to configure options (e.g. Branding, Compute Quota, Region).
            </div>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {variants.map((variant, index) => {
                const addPrice = parseFloat(variant.additionalPrice) || 0;
                const finalCalculatedPrice = parsedBasePrice + addPrice;

                return (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                  >
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Variant Name (e.g. Odoo Brand Connector)"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="w-36">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                          +₹
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="560"
                          value={variant.additionalPrice}
                          onChange={(e) => handleVariantChange(index, 'additionalPrice', e.target.value)}
                          className="w-full pl-7 pr-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-xs font-semibold text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Calculated Final Price Badge */}
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] text-stone-400 block">Final Price:</span>
                      <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatCurrency(finalCalculatedPrice, currency)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
