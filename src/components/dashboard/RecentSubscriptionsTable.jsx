import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { RECENT_SUBSCRIPTIONS } from '../../lib/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ExternalLink, ArrowRight, MoreHorizontal } from 'lucide-react';

export function RecentSubscriptionsTable() {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent Subscriptions"
        subtitle="Newly initialized and modified recurring agreements"
        action={
          <Link
            to="/subscriptions"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            View all ({RECENT_SUBSCRIPTIONS.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Customer & Account</th>
              <th className="py-3 px-4">Plan & Cycle</th>
              <th className="py-3 px-4">Contract Value</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Next Billing</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {RECENT_SUBSCRIPTIONS.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="py-3 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 ${sub.customer.avatarColor}`}
                    >
                      {sub.customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {sub.customer.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {sub.id} &bull; {sub.customer.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <p className="font-medium text-slate-800">{sub.plan}</p>
                  <p className="text-[11px] text-slate-400">{sub.billingCycle} Renewal</p>
                </td>

                <td className="py-3 px-4 font-semibold text-slate-900">
                  {formatCurrency(sub.amount)}
                  <span className="text-[10px] text-slate-400 font-normal block">
                    /{sub.billingCycle.toLowerCase()}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <StatusPill status={sub.status} />
                </td>

                <td className="py-3 px-4 text-slate-600">
                  <p className="text-xs">{formatDate(sub.nextBilling)}</p>
                  <p className="text-[10px] text-slate-400">Started {formatDate(sub.startedAt)}</p>
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="View Subscription"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      <CardFooter>
        <span className="text-xs text-slate-500">
          Showing 6 most recent agreements &bull; Demo data preview
        </span>
        <Link
          to="/subscriptions"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Manage All Subscriptions &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
