import React from 'react';
import { cn } from '../../lib/utils';

export function StatusPill({ status, className }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let styles =
    'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
  let dotColor = 'bg-stone-400 dark:bg-stone-500';

  if (['active', 'paid', 'success', 'published', 'healthy'].includes(normalized)) {
    styles =
      'bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
    dotColor = 'bg-emerald-500';
  } else if (['trial', 'trialling', 'pending', 'open', 'processing'].includes(normalized)) {
    styles =
      'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    dotColor = 'bg-amber-500';
  } else if (['past due', 'past_due', 'warning', 'expiring'].includes(normalized)) {
    styles =
      'bg-orange-50 text-orange-800 border-orange-200/90 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60';
    dotColor = 'bg-orange-500';
  } else if (['overdue', 'canceled', 'cancelled', 'failed', 'critical'].includes(normalized)) {
    styles =
      'bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
    dotColor = 'bg-rose-500';
  } else if (['paused', 'archived', 'draft'].includes(normalized)) {
    styles =
      'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800/60 dark:text-stone-400 dark:border-stone-700';
    dotColor = 'bg-stone-400';
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
