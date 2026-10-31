import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { INVOICE_STATUS_BREAKDOWN_DATA } from '../../lib/mockData';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { Receipt } from 'lucide-react';

function CustomInvoiceTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-stone-900 dark:bg-stone-800 text-white p-2.5 rounded-lg shadow-xl border border-stone-700 text-xs font-sans">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold">{data.status} Invoices</span>
        </div>
        <div className="mt-1.5 space-y-0.5 text-stone-300">
          <p>
            Amount: <span className="font-bold text-white">{formatCurrency(data.amount)}</span>
          </p>
          <p>
            Volume: <span className="text-amber-400 font-medium">{formatNumber(data.count)} invoices</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function InvoiceStatusBreakdownChart() {
  const { isDark } = useTheme();
  const totalAmount = INVOICE_STATUS_BREAKDOWN_DATA.reduce((acc, curr) => acc + curr.amount, 0);

  const gridColor = isDark ? '#27272a' : '#f1f5f9';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Invoice Status Breakdown"
        subtitle="Distribution of current billing batch receivables"
        action={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            {formatCurrency(totalAmount)} Billed
          </span>
        }
      />

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={INVOICE_STATUS_BREAKDOWN_DATA}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="status"
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
              <Tooltip content={<CustomInvoiceTooltip />} cursor={{ fill: isDark ? '#27272a40' : '#f8fafc80' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {INVOICE_STATUS_BREAKDOWN_DATA.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend pills */}
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
          {INVOICE_STATUS_BREAKDOWN_DATA.map((item) => (
            <div
              key={item.status}
              className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-stone-500 dark:text-stone-400 text-[10px] font-semibold uppercase">
                  {item.status}
                </span>
              </div>
              <p className="font-bold text-stone-900 dark:text-white text-xs">
                {formatCurrency(item.amount)}
              </p>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                {item.count} items
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
