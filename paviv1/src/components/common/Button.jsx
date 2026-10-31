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
    // Primary: Golden Yellow with readable dark charcoal text per design requirements
    primary:
      'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-stone-950 font-semibold shadow-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 dark:focus:ring-offset-stone-900 border border-amber-500/30',
    secondary:
      'bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 focus:ring-stone-400',
    outline:
      'bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-200 dark:border-stone-700 focus:ring-amber-400 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white',
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
        'inline-flex items-center justify-center rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none font-sans',
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
