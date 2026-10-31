import React from 'react';
import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 focus:ring-offset-2',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 focus:ring-slate-400',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-indigo-500 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2 text-sm font-medium gap-2',
    lg: 'px-5 py-2.5 text-base font-medium gap-2.5',
  };

  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
