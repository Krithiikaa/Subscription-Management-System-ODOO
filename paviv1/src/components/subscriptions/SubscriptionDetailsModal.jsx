import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { Badge } from '../common/Badge';
import {
  RefreshCw,
  Play,
  Pause,
  XCircle,
  Calendar,
  Building,
  CreditCard,
  History,
  Shield,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

const LIFECYCLE_STEPS = ['draft', 'quotation', 'confirmed', 'active', 'closed'];

export function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
  onConfirm,
  onActivate,
  onPause,
  onResume,
  onRenew,
  onCloseSubscription,
  currency = 'INR',
}) {
  const [closureReason, setClosureReason] = useState('');
  const [showClosePrompt, setShowClosePrompt] = useState(false);
  const [closeType, setCloseType] = useState('immediate'); // immediate | period_end

  if (!subscription) return null;

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(subscription.status);

  const handleExecuteClose = async () => {
    await onCloseSubscription(subscription.id, {
      immediate: closeType === 'immediate',
      reason: closureReason || 'Contract completed',
    });
    setShowClosePrompt(false);
    setClosureReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription Contract & Lifecycle Machine"
      subtitle={`Contract ${subscription.subscriptionNumber} &bull; ${subscription.customerName}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                {subscription.subscriptionNumber}
              </span>
              <StatusPill status={subscription.status} />
              <Badge variant="primary" size="sm">
                {subscription.billingCycle} Cycle
              </Badge>
              {subscription.cancelAtPeriodEnd && (
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Canceling at period end ({formatDate(subscription.nextBillingDate)})
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {subscription.planName} &bull; Customer: {subscription.customerName} ({subscription.customerCompany || 'Enterprise'})
            </p>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(subscription.status === 'draft' || subscription.status === 'quotation') && (
              <Button
                variant="primary"
                size="xs"
                icon={CheckCircle2}
                onClick={() => onConfirm(subscription.id)}
              >
                Confirm Contract
              </Button>
            )}

            {subscription.status === 'confirmed' && (
              <Button
                variant="primary"
                size="xs"
                icon={Play}
                onClick={() => onActivate(subscription.id)}
              >
                Activate Subscription
              </Button>
            )}

            {subscription.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="xs"
                  icon={Pause}
                  onClick={() => onPause(subscription.id)}
                >
                  Pause
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  icon={RefreshCw}
                  onClick={() => onRenew(subscription.id)}
                >
                  Renew Cycle
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  icon={XCircle}
                  onClick={() => {
                    setCloseType('immediate');
                    setShowClosePrompt(true);
                  }}
                  className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  Close
                </Button>
              </>
            )}

            {subscription.status === 'paused' && (
              <>
                <Button
                  variant="primary"
                  size="xs"
                  icon={Play}
                  onClick={() => onResume(subscription.id)}
                >
                  Resume Billing
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  icon={XCircle}
                  onClick={() => {
                    setCloseType('immediate');
                    setShowClosePrompt(true);
                  }}
                  className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  Close Early
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Subscription Lifecycle State Machine
          </p>
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = subscription.status === step;
              const isUpcoming = currentStepIndex < idx;

              return (
                <div
                  key={step}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                      : isPast
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium'
                      : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-400'
                  }`}
                >
                  <p className="text-[10px] uppercase">{`Step ${idx + 1}`}</p>
                  <p className="capitalize mt-0.5">{step}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Confirmation Prompt */}
        {showClosePrompt && (
          <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Subscription Termination Options</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3 rounded-lg border cursor-pointer ${closeType === 'immediate' ? 'bg-white dark:bg-stone-900 border-rose-400 font-semibold' : 'border-stone-200 dark:border-stone-800'}`}>
                <input
                  type="radio"
                  name="closeType"
                  value="immediate"
                  checked={closeType === 'immediate'}
                  onChange={() => setCloseType('immediate')}
                  className="mr-2"
                />
                Close Immediately (Cancel now)
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer ${closeType === 'period_end' ? 'bg-white dark:bg-stone-900 border-rose-400 font-semibold' : 'border-stone-200 dark:border-stone-800'}`}>
                <input
                  type="radio"
                  name="closeType"
                  value="period_end"
                  checked={closeType === 'period_end'}
                  onChange={() => setCloseType('period_end')}
                  className="mr-2"
                />
                Cancel at Period End ({formatDate(subscription.nextBillingDate)})
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Reason for Termination
              </label>
              <input
                type="text"
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="e.g. Client requested cancellation / project ended"
                className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setShowClosePrompt(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={handleExecuteClose}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Termination
              </Button>
            </div>
          </div>
        )}

        {/* Contract & Billing Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[10px] uppercase font-bold">Recurring Billing Rate</p>
            <p className="text-base font-bold text-stone-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(subscription.totalAmount || subscription.amount, currency)}
            </p>
            <p className="text-[11px] text-stone-500">per {subscription.billingCycle.toLowerCase()}</p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[10px] uppercase font-bold">Start Date</p>
            <p className="font-semibold text-stone-900 dark:text-white mt-0.5">
              {formatDate(subscription.startDate)}
            </p>
            <p className="text-[11px] text-stone-500">Contract active</p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[10px] uppercase font-bold">Next Billing Cycle</p>
            <p className="font-semibold text-stone-900 dark:text-white mt-0.5 font-mono">
              {formatDate(subscription.nextBillingDate || subscription.nextBilling)}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
              {subscription.autoRenew ? '✓ Auto-Renew Active' : 'Manual Renewal'}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <p className="text-stone-400 text-[10px] uppercase font-bold">Linked Quotation</p>
            <p className="font-semibold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
              {subscription.linkedQuotationNumber || subscription.linkedQuotationId || 'Direct Provision'}
            </p>
            <p className="text-[11px] text-stone-500">CPQ Source Reference</p>
          </div>
        </div>

        {/* Subscription History Audit Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
            <History className="w-4 h-4 text-amber-600" />
            <span>Complete Lifecycle Transition History</span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs bg-white dark:bg-stone-900">
            {(!subscription.history || subscription.history.length === 0) ? (
              <p className="p-4 text-center text-stone-400">No transition events recorded.</p>
            ) : (
              subscription.history.map((ev, i) => (
                <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-white">
                        {ev.event}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                        by {ev.actor}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {ev.note}
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono shrink-0">
                    {formatDate(ev.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Contract
          </Button>
        </div>
      </div>
    </Modal>
  );
}
