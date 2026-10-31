import { useState, useMemo } from 'react';
import {
  KPI_DATA,
  MONTHLY_REVENUE_DATA,
  SUBSCRIPTION_STATUS_DATA,
  RECENT_SUBSCRIPTIONS,
  RECENT_INVOICES,
} from '../lib/mockData';

export function useDashboard() {
  const [timeRange, setTimeRange] = useState('12m');

  const totals = useMemo(() => {
    const totalRev = MONTHLY_REVENUE_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalSubs = SUBSCRIPTION_STATUS_DATA.reduce((acc, curr) => acc + curr.value, 0);
    return {
      totalRev,
      totalSubs,
    };
  }, []);

  return {
    kpis: KPI_DATA,
    monthlyRevenue: MONTHLY_REVENUE_DATA,
    subscriptionStatus: SUBSCRIPTION_STATUS_DATA,
    recentSubscriptions: RECENT_SUBSCRIPTIONS,
    recentInvoices: RECENT_INVOICES,
    timeRange,
    setTimeRange,
    totals,
  };
}
