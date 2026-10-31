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

  let trendBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let TrendIcon = TrendingUp;

  if (kpi.changeType === 'warning') {
    trendBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    TrendIcon = Clock;
  } else if (kpi.changeType === 'negative') {
    trendBadgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    TrendIcon = TrendingDown;
  }

  return (
    <Card className="p-5 hover:shadow-card-hover transition-all duration-200 border-slate-200/90">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {kpi.label}
          </p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {kpi.formattedValue}
          </h4>
        </div>

        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs',
            kpi.changeType === 'negative'
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : kpi.changeType === 'warning'
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border text-[11px]',
            trendBadgeStyle
          )}
        >
          <TrendIcon className="w-3 h-3" />
          {kpi.change}
        </span>
        <span className="text-slate-400 text-[11px] font-medium truncate max-w-[140px]">
          {kpi.timeframe}
        </span>
      </div>
    </Card>
  );
}
