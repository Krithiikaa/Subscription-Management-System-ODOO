import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'neutral', size = 'sm', className }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    dark: 'bg-slate-800 text-slate-200 border-slate-700',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        variants[variant] || variants.neutral,
        sizes[size] || sizes.sm,
        className
      )}
    >
      {children}
    </span>
  );
}
