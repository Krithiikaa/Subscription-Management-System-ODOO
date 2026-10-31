import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'neutral', size = 'sm', className }) {
  const variants = {
    neutral:
      'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    primary:
      'bg-amber-50 text-amber-900 border-amber-200/90 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
    dark:
      'bg-stone-900 text-stone-100 border-stone-700 dark:bg-stone-100 dark:text-stone-900',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border font-sans',
        variants[variant] || variants.neutral,
        sizes[size] || sizes.sm,
        className
      )}
    >
      {children}
    </span>
  );
}
