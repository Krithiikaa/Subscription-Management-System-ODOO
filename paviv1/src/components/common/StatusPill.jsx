import React from 'react';
import { cn } from '../../lib/utils';

export function StatusPill({ status, className }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['active', 'paid', 'success', 'published', 'healthy'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (['trial', 'trialling', 'pending', 'open', 'processing'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
    dotColor = 'bg-blue-500';
  } else if (['past due', 'past_due', 'warning', 'expiring'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (['overdue', 'canceled', 'cancelled', 'failed', 'critical'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (['paused', 'archived', 'draft'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200/80';
    dotColor = 'bg-purple-500';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        styles,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      {status}
    </span>
  );
}
