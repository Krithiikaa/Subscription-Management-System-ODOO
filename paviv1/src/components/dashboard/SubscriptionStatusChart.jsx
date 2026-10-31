import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { SUBSCRIPTION_STATUS_DATA } from '../../lib/mockData';
import { formatNumber } from '../../lib/utils';
import { PieChart as PieIcon } from 'lucide-react';

function StatusTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold">{data.name}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-4 text-slate-300">
          <span>{formatNumber(data.value)} subscriptions</span>
          <span className="text-white font-bold">{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
}

export function SubscriptionStatusChart() {
  const total = SUBSCRIPTION_STATUS_DATA.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Subscription Status"
        subtitle="Distribution of accounts across contract states"
        action={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {formatNumber(total)} Total
          </span>
        }
      />

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        <div className="h-[210px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<StatusTooltip />} />
              <Pie
                data={SUBSCRIPTION_STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={3}
                dataKey="value"
              >
                {SUBSCRIPTION_STATUS_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">89.9%</span>
            <span className="text-[11px] font-medium text-slate-400">Retention</span>
          </div>
        </div>

        {/* Custom Status Legend */}
        <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          {SUBSCRIPTION_STATUS_DATA.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/70 border border-slate-100"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 truncate text-[11px] font-medium">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 font-semibold text-slate-800 text-[11px]">
                <span>{item.value}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
