import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import {
  Activity,
  UserPlus,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  FileText,
  CheckCheck,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function AdminRecentActivities({ activities = [], loading = false, onRefresh }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment_success':
        return {
          icon: CheckCircle2,
          style: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        };
      case 'payment_failed':
        return {
          icon: AlertCircle,
          style: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        };
      case 'invoice_generated':
        return {
          icon: FileText,
          style: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        };
      case 'quote_accepted':
        return {
          icon: CheckCheck,
          style: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        };
      case 'sub_renewed':
        return {
          icon: RefreshCw,
          style: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800',
        };
      case 'admin_bootstrap':
        return {
          icon: ShieldCheck,
          style: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        };
      case 'staff_joined':
      case 'staff_invitation':
        return {
          icon: Mail,
          style: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        };
      case 'user_registered':
      default:
        return {
          icon: UserPlus,
          style: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        };
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'staff':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'customer':
      default:
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title="Live System Activities"
        subtitle="Real-time audit log of security events, registrations, and administrative invitations"
        action={
          onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium p-1 rounded-md"
              title="Refresh activity logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )
        }
      />

      <CardContent className="flex-1 p-0">
        {activities.length === 0 ? (
          <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-stone-400 dark:text-stone-500 mb-3 border border-stone-200 dark:border-stone-700">
              <Activity className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-semibold text-stone-900 dark:text-white">
              No Activities Logged Yet
            </h5>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              Live audit events from Supabase (customer registrations, staff invitations, and role assignments) will automatically populate here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {activities.map((act) => {
              const { icon: Icon, style } = getActivityIcon(act.type);
              const formattedTime = act.timestamp ? formatDate(act.timestamp) : 'Recent';

              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors flex items-start gap-3.5"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 shadow-2xs ${style}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                        {act.title}
                      </p>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0 font-sans flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedTime}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 truncate">
                      {act.description}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {act.role && (
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getRoleBadge(
                            act.role
                          )}`}
                        >
                          {act.role}
                        </span>
                      )}
                      {act.status && (
                        <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Status: {act.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
