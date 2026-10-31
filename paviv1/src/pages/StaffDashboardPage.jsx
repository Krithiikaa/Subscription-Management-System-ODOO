import React from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { Button } from '../components/common/Button';
import {
  Users,
  RefreshCw,
  Receipt,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { RECENT_SUBSCRIPTIONS, RECENT_INVOICES } from '../lib/mockData';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

export function StaffDashboardPage() {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              Staff Operations Workspace
            </span>
            <span className="text-xs text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {today}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Operational Desk
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Day-to-day subscription renewals, billing reconciliation, and customer account routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Badge variant="primary" size="md">
            Role: Operational Staff
          </Badge>
        </div>
      </div>

      {/* RBAC Boundary Notification */}
      <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-300">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>RBAC Active:</strong> Staff access is restricted to operational management. Administrative user invitations and system settings require enterprise admin credentials.
          </span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 shrink-0">
          Enforced by PostgreSQL RLS
        </span>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Active Subscribers</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">1,284</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            +38 renewed this week
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Pending Invoices</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">18</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 font-medium">
            $14,820 awaiting settlement
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Overdue Chasing</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">7</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-3 font-medium">
            Dunning retry scheduled
          </p>
        </Card>

        <Card className="p-4 border-stone-200/90 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Quotations in Review</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">19</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-3 font-medium">
            $74,200 open pipeline
          </p>
        </Card>
      </div>

      {/* Staff Operational Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions to Review */}
        <Card>
          <CardHeader
            title="Subscription Actions Required"
            subtitle="Recent contract changes awaiting verification"
          />
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {RECENT_SUBSCRIPTIONS.slice(0, 4).map((sub) => (
                <div key={sub.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-white truncate">
                      {sub.customer.name}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {sub.plan} &bull; {formatCurrency(sub.amount)}/{sub.billingCycle.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={sub.status} />
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => alert(`Reviewing operational subscription record ${sub.id}`)}
                    >
                      Process
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices Pending Settlement */}
        <Card>
          <CardHeader
            title="Immediate Receivables"
            subtitle="Statements pending confirmation or dunning reminders"
          />
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {RECENT_INVOICES.slice(0, 4).map((inv) => (
                <div key={inv.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-white truncate">
                      {inv.customer}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono">
                      {inv.id} &bull; Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-stone-900 dark:text-white">
                      {formatCurrency(inv.amount)}
                    </span>
                    <StatusPill status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
