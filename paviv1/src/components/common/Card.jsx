import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#15181e] border border-stone-200/90 dark:border-stone-800 rounded-xl shadow-subtle overflow-hidden transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className, children }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-stone-100 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        className
      )}
    >
      <div>
        {title && (
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight font-sans">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('p-6 text-stone-900 dark:text-stone-100', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        'px-6 py-3.5 bg-stone-50/60 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400',
        className
      )}
    >
      {children}
    </div>
  );
}
