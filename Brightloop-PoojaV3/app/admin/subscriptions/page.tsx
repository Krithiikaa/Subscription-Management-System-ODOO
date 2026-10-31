"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import { Repeat } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Subscriptions
          </h1>
          <p className="text-sm text-slate-500">
            All active, draft, quotation, and completed subscriptions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Subscription #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">Next Invoice</th>
                  <th className="px-6 py-3.5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading subscriptions...</td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No subscriptions found.</td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {sub.number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{sub.customer.name}</div>
                        <div className="text-xs text-slate-400">{sub.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{sub.plan.name}</span>
                        <span className="text-xs text-slate-400 block">{sub.plan.billingPeriod}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <DateText date={sub.startDate} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {sub.nextInvoiceDate ? <DateText date={sub.nextInvoiceDate} /> : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <MoneyText amount={sub.totalAmount} className="font-semibold text-slate-900 dark:text-slate-100" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

