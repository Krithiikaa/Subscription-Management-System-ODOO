import React from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

export function CustomerPortalPage() {
  const { user, profile } = useAuth();

  const customerName = profile?.full_name || user?.user_metadata?.full_name || 'Acme Corporation';
  const customerEmail = profile?.email || user?.email || 'billing@acmecorp.com';

  // Customer-scoped subscriptions demonstration data
  const mySubscriptions = [
    {
      id: 'SUB-9402',
      plan: 'Enterprise Cloud Plus',
      billingCycle: 'Annual',
      amount: 4800,
      status: 'Active',
      startedAt: '2026-10-24',
      nextBilling: '2027-10-24',
      seatCount: '50 Seats Included',
    },
    {
      id: 'SUB-9104',
      plan: 'Dedicated Analytics Add-on',
      billingCycle: 'Monthly',
      amount: 250,
      status: 'Active',
      startedAt: '2026-09-01',
      nextBilling: '2026-11-01',
      seatCount: 'Add-on License',
    },
  ];

  // Customer-scoped invoices demonstration data
  const myInvoices = [
    {
      id: 'INV-2026-1141',
      issueDate: '2026-10-24',
      dueDate: '2026-11-08',
      amount: 4800.0,
      status: 'Paid',
      method: 'Wire Transfer (ACH)',
    },
    {
      id: 'INV-2026-1082',
      issueDate: '2026-09-24',
      dueDate: '2026-10-09',
      amount: 250.0,
      status: 'Paid',
      method: 'Corporate Card (••4242)',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              Tenant Self-Service Hub
            </span>
            <span className="text-xs text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Account: {customerEmail}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Welcome back, {customerName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your subscribed products, view tax invoices, and update billing arrangements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Badge variant="primary" size="md">
            Customer Portal
          </Badge>
        </div>
      </div>

      {/* RLS Security Guard Card */}
      <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs flex items-center justify-between gap-3 text-amber-950 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Tenant Isolation Active:</strong> Your session is strictly scoped to your tenant profile. All requests are protected by Supabase Row Level Security.
          </span>
        </div>
        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 shrink-0">
          auth.uid() = profile.id
        </span>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">Active Agreements</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
            {mySubscriptions.length} Plans
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            Renews Oct 24, 2027
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">Current Annual Spend</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
            {formatCurrency(5050)}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
            Base tier + Analytics
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <p className="text-[10px] font-bold text-stone-400 uppercase">Payment Standing</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Good Standing
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
            0 overdue invoices
          </p>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader
          title="My Subscriptions"
          subtitle="Your enterprise licenses and add-on subscriptions"
        />
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">
                <th className="py-3 px-4 sm:px-6">Subscription ID</th>
                <th className="py-3 px-4">Plan & Entitlements</th>
                <th className="py-3 px-4">Billing Rate</th>
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
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-stone-900 dark:text-white">{sub.plan}</p>
                    <p className="text-[11px] text-stone-400">{sub.seatCount}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                    {formatCurrency(sub.amount)}/{sub.billingCycle.toLowerCase()}
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
                      onClick={() => alert(`Opening plan management details for ${sub.id}`)}
                    >
                      Manage Plan
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
          subtitle="Download paid invoice receipts and review transaction history"
        />
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">
                <th className="py-3 px-4 sm:px-6">Invoice #</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Download PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {myInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-stone-900 dark:text-white">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                    {formatDate(inv.issueDate)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                    {inv.method}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading verified statement PDF for ${inv.id}`)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Download PDF"
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
