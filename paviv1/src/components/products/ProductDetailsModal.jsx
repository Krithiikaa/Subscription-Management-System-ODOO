import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Package,
  Layers,
  IndianRupee,
  Edit3,
  Archive,
  CheckCircle2,
  Calendar,
  Tag,
  TrendingUp,
} from 'lucide-react';

export function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onToggleArchive,
  currency = 'INR',
}) {
  if (!product) return null;

  const salesPrice = Number(product.salesPrice || 0);
  const costPrice = Number(product.costPrice || 0);
  const profitMargin = salesPrice > 0 ? (((salesPrice - costPrice) / salesPrice) * 100).toFixed(1) : 0;
  const variants = product.variants || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`Product Code: ${product.code || 'PRD-DEFAULT'} • Category: ${product.category}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 font-sans">
        {/* Top Status & Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Base Sales Price
            </span>
            <span className="text-xl font-bold text-stone-900 dark:text-white mt-1 block font-mono">
              {formatCurrency(salesPrice, currency)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Gross Margin: ~{profitMargin}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Unit Cost Price
            </span>
            <span className="text-xl font-bold text-stone-700 dark:text-stone-300 mt-1 block font-mono">
              {formatCurrency(costPrice, currency)}
            </span>
            <span className="text-[10px] text-stone-400">
              Estimated direct operational cost
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Lifecycle State
              </span>
              <div className="mt-1">
                <StatusPill status={product.status} />
              </div>
            </div>
            <span className="text-[10px] text-stone-400">
              Created: {formatDate(product.createdAt)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1.5">
            Product Specifications
          </h4>
          <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 rounded-xl p-3.5 leading-relaxed">
            {product.description || 'No detailed specifications entered for this product.'}
          </p>
        </div>

        {/* Product Variants Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              Configured Variants ({variants.length})
            </h4>
            <span className="text-[11px] text-stone-400">
              Sales Price + Additional Price = Final Price
            </span>
          </div>

          {variants.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
              No variants defined for this product. Base sales price applies to all subscriptions.
            </div>
          ) : (
            <div className="border border-stone-200/80 dark:border-stone-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">
                    <th className="py-2.5 px-3">Variant Name</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Additional Price</th>
                    <th className="py-2.5 px-3 font-bold text-stone-900 dark:text-white">
                      Calculated Final Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {variants.map((v, i) => {
                    const addPrice = Number(v.additionalPrice || 0);
                    const finalPrice = salesPrice + addPrice;
                    return (
                      <tr key={v.id || i} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40">
                        <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-white">
                          {v.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-400">
                          {v.sku || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-700 dark:text-stone-300">
                          +{formatCurrency(addPrice, currency)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(finalPrice, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleArchive(product.id, product.status)}
            className="text-stone-600 dark:text-stone-300"
          >
            {product.status === 'active' ? 'Archive Product' : 'Unarchive Product'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              Edit Product
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
