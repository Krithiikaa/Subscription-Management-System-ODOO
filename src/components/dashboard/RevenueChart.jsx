import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { MONTHLY_REVENUE_DATA } from '../../lib/mockData';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, Calendar } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
        <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-2">
          {label} 2026
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function RevenueChart() {
  const [viewMode, setViewMode] = useState('stacked'); // 'stacked' | 'total'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Monthly Revenue Trend"
        subtitle="Gross recurring revenue (MRR) and subscription add-ons over last 12 months"
        action={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'stacked'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Breakdown
              </button>
              <button
                onClick={() => setViewMode('total')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'total'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Total
              </button>
            </div>
          </div>
        }
      />

      <CardContent className="flex-1 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">October Revenue</span>
              <span className="text-lg font-bold text-slate-900">$184,650</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-500 block">MRR Growth</span>
              <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +15.4% YoY
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> FY 2025-2026
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MONTHLY_REVENUE_DATA}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAddons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {viewMode === 'stacked' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="Base MRR"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMrr)"
                  />
                  <Area
                    type="monotone"
                    dataKey="addons"
                    name="Add-ons & Usage"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAddons)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Total Gross Revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              )}
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
