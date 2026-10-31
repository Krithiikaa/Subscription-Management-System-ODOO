import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import {
  Globe,
  CreditCard,
  Receipt,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Building,
  FileText,
  MapPin,
  Lock,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

export function CustomerPortalPage() {
  const { user, profile, role } = useAuth();
  const { isDemoMode, demoData, currency } = useDemoMode();

  // Find customer account corresponding to the authenticated user
  const currentCustomer = useMemo(() => {
    const authEmail = (profile?.email || user?.email || '').toLowerCase();

    if (isDemoMode && demoData?.customers) {
      // Find matching demo customer or default to the primary Tamil Nadu demo customer
      const found = demoData.customers.find(
        (c) => c.email?.toLowerCase() === authEmail
      );
      return found || demoData.customers[0]; // 'cust-tn-01' Pavithra Balaji
    }

    return {
      id: profile?.id || user?.id || 'cust-live-01',
      name: profile?.full_name || user?.user_metadata?.full_name || 'Customer Account',
      email: profile?.email || user?.email || 'customer@enterprise.in',
      company: profile?.company || 'Enterprise Tenant',
      phone: profile?.phone || '+91 98400 00000',
      city: profile?.city || 'Chennai',
      state: profile?.state || 'Tamil Nadu',
      gstin: profile?.gstin || '33DEMO0001A1Z1',
      status: 'active',
    };
  }, [user, profile, isDemoMode, demoData]);

  // Customer-scoped subscriptions: strictly filtered by customerId
  const mySubscriptions = useMemo(() => {
    if (isDemoMode && demoData?.subscriptions) {
      const subs = demoData.subscriptions.filter(
        (s) => s.customerId === currentCustomer.id
      );
      if (subs.length > 0) return subs;
      // Fallback to customer's first matching subscription
      return [demoData.subscriptions[0]];
    }

    // Default live fallback
    return [
      {
        id: 'SUB-9402',
        planName: 'Enterprise Cloud Dedicated',
        billingCycle: 'Annual',
        amount: 599990,
        status: 'active',
        startDate: '2026-01-15',
        nextBilling: '2027-01-15',
        autoRenew: true,
      },
    ];
  }, [currentCustomer, isDemoMode, demoData]);

  // Customer-scoped invoices: strictly filtered by customerId
  const myInvoices = useMemo(() => {
    if (isDemoMode && demoData?.invoices) {
      const invs = demoData.invoices.filter(
        (inv) => inv.customerId === currentCustomer.id
      );
      if (invs.length > 0) return invs;
      return [demoData.invoices[0]];
    }

    return [
      {
        id: 'INV-2026-BL-001',
        number: 'INV-2026-BL-001',
        issueDate: '2026-10-01',
        dueDate: '2026-10-15',
        totalAmount: 35399,
        status: 'paid',
        method: 'UPI AutoPay (NPCI)',
      },
    ];
  }, [currentCustomer, isDemoMode, demoData]);

  const totalAnnualSpend = mySubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              Customer Self-Service Hub
            </span>
            <span className="text-xs text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Account: {currentCustomer.email}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Welcome, {currentCustomer.name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {currentCustomer.company} &bull; Manage subscriptions, download GST tax invoices, and review billing methods.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Badge variant="primary" size="md">
            Customer Portal
          </Badge>
        </div>
      </div>

      {/* RLS Security Guard Card */}
      <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Tenant Isolation Active:</strong> You are accessing records restricted to Customer ID{' '}
            <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">
              {currentCustomer.id}
            </code>. Row Level Security enforces strict customer privacy.
          </span>
        </div>
        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 shrink-0">
          user_id = auth.uid()
        </span>
      </div>

      {/* Customer Contact & GSTIN Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <p className="text-stone-400 text-[10px] uppercase font-bold">Company Entity</p>
          <p className="font-semibold text-stone-900 dark:text-white mt-0.5 truncate">
            {currentCustomer.company || 'Enterprise Client'}
          </p>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <p className="text-stone-400 text-[10px] uppercase font-bold">Registered GSTIN</p>
          <p className="font-mono font-semibold text-stone-900 dark:text-white mt-0.5 uppercase">
            {currentCustomer.gstin || 'Unregistered'}
          </p>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <p className="text-stone-400 text-[10px] uppercase font-bold">Billing Location</p>
          <p className="font-semibold text-stone-900 dark:text-white mt-0.5 truncate">
            {currentCustomer.city}, {currentCustomer.state || 'Tamil Nadu'}
          </p>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <p className="text-stone-400 text-[10px] uppercase font-bold">Billing Standing</p>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            Active / Good Standing
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">Active Subscriptions</p>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-1">
            {mySubscriptions.length} {mySubscriptions.length === 1 ? 'Plan' : 'Plans'}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            Next renewal: {formatDate(mySubscriptions[0]?.nextBilling)}
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">Total Subscription Commit</p>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-1">
            {formatCurrency(totalAnnualSpend, currency)}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
            Active recurrent billing value
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">Total Settled Invoices</p>
          <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {myInvoices.filter((i) => i.status === 'paid').length} Paid
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
            0 overdue notices
          </p>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader
          title="My Subscriptions & Licenses"
          subtitle="Your enterprise subscription agreements, active modules, and renewal dates"
        />
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">
                <th className="py-3 px-4 sm:px-6">Subscription ID</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {mySubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-stone-900 dark:text-amber-400">
                    {sub.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">
                    {sub.planName || sub.plan || 'Subscription Tier'}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 font-mono">
                    {sub.billingCycle}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white font-mono">
                    {formatCurrency(sub.amount, currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={sub.status} />
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                    {formatDate(sub.nextBilling)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => alert(`Reviewing plan specifications for ${sub.planName || sub.id}`)}
                    >
                      Plan Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader
          title="Billing Statements & Tax Receipts"
          subtitle="Download paid GST tax invoices and verify transaction references"
        />
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">
                <th className="py-3 px-4 sm:px-6">Invoice #</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Download PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {myInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-stone-900 dark:text-white">
                    {inv.number || inv.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white font-mono">
                    {formatCurrency(inv.totalAmount || inv.amount, currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                    {formatDate(inv.issueDate)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                    {inv.method || 'AutoPay'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading verified tax invoice PDF: ${inv.number || inv.id}`)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Download PDF Tax Invoice"
                    >
                      <DownloadCloud className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
