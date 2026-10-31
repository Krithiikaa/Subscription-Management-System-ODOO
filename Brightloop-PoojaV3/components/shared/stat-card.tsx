import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  sparklineData?: number[];
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  sparklineData,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold font-heading tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
            {value}
          </div>

          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trend.isPositive
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <TrendingDown className="h-3 w-3 stroke-[2.5]" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {trend?.label && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {trend.label}
          </p>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 h-6 flex items-end gap-1">
            {sparklineData.map((val, i) => {
              const max = Math.max(...sparklineData, 1);
              const heightPct = Math.max(15, (val / max) * 100);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-indigo-200 dark:bg-indigo-900/60 hover:bg-indigo-500 transition-colors"
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

