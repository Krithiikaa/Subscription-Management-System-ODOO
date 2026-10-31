import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/80 rounded-xl shadow-subtle overflow-hidden',
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
        'px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        className
      )}
    >
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        'px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}
