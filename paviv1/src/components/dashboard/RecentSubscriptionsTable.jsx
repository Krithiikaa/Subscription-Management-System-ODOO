import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { RECENT_SUBSCRIPTIONS } from '../../lib/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ExternalLink, ArrowRight } from 'lucide-react';

export function RecentSubscriptionsTable({ subscriptions = [] }) {
  const hasSubscriptions = subscriptions && subscriptions.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent Subscriptions"
        subtitle="Newly initialized and recurring SaaS agreements"
        action={
          <Link
            to="/subscriptions"
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 transition-colors font-sans"
          >
            Manage Subscriptions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <CardContent className="p-0 overflow-x-auto">
        {!hasSubscriptions ? (
          <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-stone-400 dark:text-stone-500 mb-3 border border-stone-200 dark:border-stone-700">
              <ExternalLink className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-semibold text-stone-900 dark:text-white">
              No Subscriptions Recorded
            </h5>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              Live subscription contracts will appear here once agreements are created. The database tables will be initialized in Module 4.
            </p>
            <div className="mt-4">
              <Link
                to="/subscriptions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-500 text-stone-950 transition-colors shadow-2xs"
              >
                Create First Subscription &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-sans">

          <thead>
            <tr className="bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Customer & Account</th>
              <th className="py-3 px-4">Plan & Cycle</th>
              <th className="py-3 px-4">Contract Value</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Next Billing</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs">
            {RECENT_SUBSCRIPTIONS.map((sub) => (
              <tr
                key={sub.id}
                className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40 transition-colors group"
              >
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs ${sub.customer.avatarColor}`}
                    >
                      {sub.customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 dark:text-white truncate">
                        {sub.customer.name}
                      </p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono truncate">
                        {sub.id} &bull; {sub.customer.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-medium text-stone-800 dark:text-stone-200">{sub.plan}</p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{sub.billingCycle} Cycle</p>
                </td>

                <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">
                  {formatCurrency(sub.amount)}
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal block">
                    /{sub.billingCycle.toLowerCase()}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <StatusPill status={sub.status} />
                </td>

                <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                  <p className="text-xs">{formatDate(sub.nextBilling)}</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">
                    Started {formatDate(sub.startedAt)}
                  </p>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    title="View Subscription"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </CardContent>

      {hasSubscriptions && (
        <CardFooter>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Showing {subscriptions.length} active agreement(s)
          </span>
          <Link
            to="/subscriptions"
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          >
            Manage All Subscriptions &rarr;
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
