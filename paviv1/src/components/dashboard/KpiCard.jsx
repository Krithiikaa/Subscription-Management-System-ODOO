import React from 'react';
import {
  Layers,
  CheckCircle2,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';

const ICON_MAP = {
  Layers,
  CheckCircle2,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
};

export function KpiCard({ kpi }) {
  const Icon = ICON_MAP[kpi.icon] || Layers;

  let trendBadgeStyle =
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
  let TrendIcon = TrendingUp;

  if (kpi.changeType === 'warning') {
    trendBadgeStyle =
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    TrendIcon = Clock;
  } else if (kpi.changeType === 'negative') {
    trendBadgeStyle =
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
    TrendIcon = TrendingDown;
  }

  return (
    <Card className="p-5 hover:shadow-card-hover transition-all duration-200 border-stone-200/90 dark:border-stone-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            {kpi.label}
          </p>
          <h4 className="text-2xl font-bold text-stone-900 dark:text-white mt-1.5 tracking-tight font-sans">
            {kpi.formattedValue}
          </h4>
        </div>

        {/* Icon with golden yellow theme styling */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-colors',
            kpi.changeType === 'negative'
              ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
              : kpi.changeType === 'warning'
              ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border text-[11px]',
            trendBadgeStyle
          )}
        >
          <TrendIcon className="w-3 h-3" />
          {kpi.change}
        </span>
        <span className="text-stone-400 dark:text-stone-500 text-[11px] font-medium truncate max-w-[140px]">
          {kpi.timeframe}
        </span>
      </div>
    </Card>
  );
}
