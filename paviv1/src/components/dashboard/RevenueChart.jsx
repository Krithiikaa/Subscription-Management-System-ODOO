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
import { useTheme } from '../../context/ThemeContext';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 dark:bg-stone-800 text-white p-3 rounded-lg shadow-xl border border-stone-700 text-xs font-sans">
        <p className="font-semibold text-stone-200 border-b border-stone-800 pb-1 mb-2">
          {label} 2026
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-stone-300">
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
  const { isDark } = useTheme();

  const gridColor = isDark ? '#27272a' : '#f1f5f9';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Revenue Trend"
        subtitle="Gross recurring revenue (MRR) and subscription add-ons over last 12 months"
        action={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium">
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'stacked'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Breakdown
              </button>
              <button
                onClick={() => setViewMode('total')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'total'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
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
          <div className="flex items-center gap-4 text-xs font-sans">
            <div>
              <span className="text-stone-500 dark:text-stone-400 block">October Billed</span>
              <span className="text-xl font-bold text-stone-900 dark:text-white font-sans">
                $184,650
              </span>
            </div>
            <div className="border-l border-stone-200 dark:border-stone-800 pl-4">
              <span className="text-stone-500 dark:text-stone-400 block">YoY MRR Expansion</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +15.4%
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1 font-sans">
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
                {/* Golden Yellow Gradient for MRR */}
                <linearGradient id="colorGoldMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                {/* Secondary Accent for Addons */}
                <linearGradient id="colorAddons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#71717A" stopOpacity={0.0} />
                </linearGradient>
                {/* Total Gross Revenue */}
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor, fontSize: 11, fontFamily: 'Montserrat' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor, fontSize: 11, fontFamily: 'Montserrat' }}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {viewMode === 'stacked' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="Base MRR"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorGoldMrr)"
                  />
                  <Area
                    type="monotone"
                    dataKey="addons"
                    name="Usage & Add-ons"
                    stroke="#71717A"
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
                  stroke="#EAB308"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              )}
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '11px',
                  paddingTop: '10px',
                  fontFamily: 'Montserrat',
                  color: textColor,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
