import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_CUSTOMERS,
  DEMO_STAFF,
  DEMO_PRODUCTS,
  DEMO_PLANS,
  DEMO_QUOTATIONS,
  DEMO_SUBSCRIPTIONS,
  DEMO_INVOICES,
  DEMO_PAYMENTS,
  DEMO_ACTIVITIES,
  DEMO_METRICS,
  DEMO_MONTHLY_REVENUE_DATA,
  DEMO_SUBSCRIPTION_STATUS_DATA,
  DEMO_INVOICE_STATUS_DATA,
  DEMO_DATASET_SUMMARY,
} from '../lib/demoData';

const DemoModeContext = createContext(null);

const STORAGE_KEY = 'brightloop_demo_mode';

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Default to true so user sees the 302 Tamil Nadu demo records out of the box
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isDemoMode));
    } catch (e) {
      console.warn('Could not persist demo mode setting:', e);
    }
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const setDemoMode = (val) => {
    setIsDemoMode(Boolean(val));
  };

  const value = {
    isDemoMode,
    toggleDemoMode,
    setDemoMode,
    currency: isDemoMode ? 'INR' : 'USD',
    currencySymbol: isDemoMode ? '₹' : '$',
    datasetSummary: DEMO_DATASET_SUMMARY,
    demoMetrics: DEMO_METRICS,
    monthlyRevenueData: DEMO_MONTHLY_REVENUE_DATA,
    subscriptionStatusData: DEMO_SUBSCRIPTION_STATUS_DATA,
    invoiceStatusData: DEMO_INVOICE_STATUS_DATA,
    demoData: {
      customers: DEMO_CUSTOMERS,
      staff: DEMO_STAFF,
      products: DEMO_PRODUCTS,
      plans: DEMO_PLANS,
      quotations: DEMO_QUOTATIONS,
      subscriptions: DEMO_SUBSCRIPTIONS,
      invoices: DEMO_INVOICES,
      payments: DEMO_PAYMENTS,
      activities: DEMO_ACTIVITIES,
    },
  };

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
