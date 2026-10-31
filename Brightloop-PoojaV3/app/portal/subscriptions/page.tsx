"use client";

import * as React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Repeat, ArrowRight, Calendar } from "lucide-react";

export default function CustomerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscriptions) setSubscriptions(data.subscriptions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            My Subscriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your active plans, track billing cycles, and inspect contract timelines.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No active subscriptions found"
          description="You do not currently have any active subscriptions. Contact our team to initiate a quotation."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subscriptions.map((sub) => (
            <Card
              key={sub.id}
              className="flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {sub.number}
                    </span>
                    <CardTitle className="text-lg">{sub.plan.name}</CardTitle>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Billing Cycle:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200 uppercase">
                      {sub.plan.billingPeriod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Next Invoice Date:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      <DateText date={sub.nextInvoiceDate} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Amount:</span>
                    <MoneyText amount={sub.totalAmount} className="text-sm font-bold text-slate-900 dark:text-white" />
                  </div>
                </div>

                <Link href={`/portal/subscriptions/${sub.id}`} className="block">
                  <Button variant="outline" className="w-full justify-between text-xs font-semibold h-9">
                    <span>View Subscription & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

