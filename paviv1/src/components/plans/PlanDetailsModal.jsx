import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  CreditCard,
  Calendar,
  Check,
  X,
  Edit3,
  Archive,
  Layers,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';

export function PlanDetailsModal({
  isOpen,
  onClose,
  plan,
  linkedProduct,
  onEdit,
  onToggleArchive,
  currency = 'INR',
}) {
  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan.name}
      subtitle={`Plan Code: ${plan.code || 'PLN-DEFAULT'} • ${plan.billingCycle} Billing Cycle`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 font-sans">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Plan Price
            </span>
            <span className="text-xl font-bold text-stone-900 dark:text-white mt-1 block font-mono">
              {formatCurrency(plan.price, currency)}
            </span>
            <span className="text-[10px] text-stone-400">
              Billed per {plan.billingCycle?.toLowerCase() || 'cycle'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Billing Frequency
            </span>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-1 block">
              {plan.billingCycle}
            </span>
            <span className="text-[10px] text-stone-400">
              Min. Quantity: {plan.minQuantity || 1} seat(s)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Lifecycle State
              </span>
              <div className="mt-1">
                <StatusPill status={plan.status} />
              </div>
            </div>
            <span className="text-[10px] text-stone-400">
              Created {formatDate(plan.createdAt)}
            </span>
          </div>
        </div>

        {/* Linked Product Context */}
        {linkedProduct ? (
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">
                  Linked Product: {linkedProduct.name}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {linkedProduct.category} &bull; Base Price: {formatCurrency(linkedProduct.salesPrice, currency)}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-800 dark:text-amber-300">
              {linkedProduct.code}
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 text-xs text-stone-500 flex items-center gap-2">
            <Package className="w-4 h-4 text-stone-400" />
            <span>Standalone Plan &bull; No single product linked</span>
          </div>
        )}

        {/* Validity Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
            <span className="text-stone-400 block text-[11px]">Available From</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block font-mono">
              {plan.availableFrom ? formatDate(plan.availableFrom) : 'No start restriction'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
            <span className="text-stone-400 block text-[11px]">Available Until</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block font-mono">
              {plan.availableUntil ? formatDate(plan.availableUntil) : 'Indefinite / Evergreen'}
            </span>
          </div>
        </div>

        {/* Policy Matrix */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2">
            Subscription Lifecycle Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              {plan.closeAtEndOfPeriod ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-stone-400 shrink-0" />
              )}
              <span className="text-stone-800 dark:text-stone-200">
                Close at end of billing period
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              {plan.allowEarlyClosure ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-stone-400 shrink-0" />
              )}
              <span className="text-stone-800 dark:text-stone-200">
                Early cancellation allowed
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              {plan.allowPause ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-stone-400 shrink-0" />
              )}
              <span className="text-stone-800 dark:text-stone-200">
                Subscription pause allowed
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
              {plan.allowRenewal ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-stone-400 shrink-0" />
              )}
              <span className="text-stone-800 dark:text-stone-200">
                Automatic renewal enabled
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {plan.description && (
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1">
              Plan Description
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 rounded-xl p-3 leading-relaxed">
              {plan.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleArchive(plan.id, plan.status)}
            className="text-stone-600 dark:text-stone-300"
          >
            {plan.status === 'active' ? 'Archive Plan' : 'Unarchive Plan'}
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
                onEdit(plan);
              }}
            >
              Edit Plan
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
