import React from 'react';
import {
  Users,
  ShieldCheck,
  RefreshCw,
  DollarSign,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Database,
  Info,
} from 'lucide-react';
import { Card } from '../common/Card';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function AdminKpiGrid({ metrics, tablesStatus, loading }) {
  const kpiItems = [
    {
      id: 'total-customers',
      label: 'Total Customers',
      value: loading ? '...' : metrics.totalCustomers,
      formattedValue: loading ? '...' : String(metrics.totalCustomers),
      timeframe: 'Registered customer accounts',
      icon: Users,
      path: '/customers',
      colorStyle: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
      isRealData: true,
      emptyState: metrics.totalCustomers === 0 ? 'No customer accounts yet' : null,
      emptyDesc: 'New customer signups will sync here automatically from public.profiles',
    },
    {
      id: 'total-staff',
      label: 'Total Staff',
      value: loading ? '...' : metrics.totalStaff,
      formattedValue: loading ? '...' : String(metrics.totalStaff),
      timeframe: `${metrics.pendingStaffInvitations} pending invite(s)`,
      icon: ShieldCheck,
      path: '/staff-management',
      colorStyle: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
      isRealData: true,
      emptyState: metrics.totalStaff === 0 ? 'No staff onboarded' : null,
      emptyDesc: 'Use Staff Management to issue administrator invitations',
    },
    {
      id: 'active-subscriptions',
      label: 'Active Subscriptions',
      value: loading ? '...' : metrics.activeSubscriptions,
      formattedValue: loading ? '...' : String(metrics.activeSubscriptions),
      timeframe: tablesStatus.subscriptions ? 'Active recurring contracts' : 'Module 4 pending',
      icon: RefreshCw,
      path: '/subscriptions',
      colorStyle: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
      isRealData: tablesStatus.subscriptions,
      emptyState: !tablesStatus.subscriptions ? 'Table pending migration' : metrics.activeSubscriptions === 0 ? '0 active contracts' : null,
      emptyDesc: 'Subscription billing engine table will be connected in Module 4',
    },
    {
      id: 'monthly-revenue',
      label: 'Monthly Revenue',
      value: loading ? '...' : metrics.monthlyRevenue,
      formattedValue: loading ? '...' : formatCurrency(metrics.monthlyRevenue),
      timeframe: tablesStatus.invoices || tablesStatus.payments ? 'Gross recurring MRR' : 'No revenue recorded',
      icon: DollarSign,
      path: '/invoices',
      colorStyle: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      isRealData: tablesStatus.invoices || tablesStatus.payments,
      emptyState: metrics.monthlyRevenue === 0 ? '$0.00 collected' : null,
      emptyDesc: 'Revenue metrics calculate live once paid invoices exist',
    },
    {
      id: 'pending-invoices',
      label: 'Pending Invoices',
      value: loading ? '...' : metrics.pendingInvoices,
      formattedValue: loading ? '...' : String(metrics.pendingInvoices),
      timeframe: tablesStatus.invoices ? 'Awaiting settlement' : 'Module pending',
      icon: Receipt,
      path: '/invoices',
      colorStyle: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
      isRealData: tablesStatus.invoices,
      emptyState: metrics.pendingInvoices === 0 ? '0 pending invoices' : null,
      emptyDesc: 'Unsettled customer invoices will show here once created',
    },
    {
      id: 'overdue-payments',
      label: 'Overdue Payments',
      value: loading ? '...' : metrics.overduePayments,
      formattedValue: loading ? '...' : String(metrics.overduePayments),
      timeframe: metrics.overduePayments > 0 ? 'Requires immediate action' : 'Zero overdue payments',
      icon: AlertTriangle,
      path: '/payments',
      colorStyle: metrics.overduePayments > 0
        ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
        : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      isRealData: tablesStatus.invoices || tablesStatus.payments,
      emptyState: metrics.overduePayments === 0 ? 'No overdue payments' : null,
      emptyDesc: 'Delinquent or unpaid accounts will be flagged here',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.id}
            className="p-4 hover:shadow-card-hover transition-all duration-200 border-stone-200/90 dark:border-stone-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <h4 className="text-2xl font-bold text-stone-900 dark:text-white mt-1.5 tracking-tight font-sans">
                    {item.formattedValue}
                  </h4>
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${item.colorStyle}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {item.emptyState ? (
                <div className="mt-3 py-1 px-2 rounded-md bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="truncate">{item.emptyState}</span>
                </div>
              ) : (
                <div className="mt-3 py-1 px-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate">Live Supabase Record</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium truncate max-w-[130px]">
                {item.timeframe}
              </span>

              <Link
                to={item.path}
                className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-0.5 transition-colors"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
