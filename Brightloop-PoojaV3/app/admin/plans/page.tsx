"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoneyText } from "@/components/shared/money-text";
import { Layers, CheckCircle2, XCircle } from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) setPlans(data.plans);
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
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-500">
            Configure billing periods, minimum quantities, and lifecycle flags.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No plans configured yet.</div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {plan.billingPeriod}
                  </span>
                  <Layers className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-lg mt-3">{plan.name}</CardTitle>
                <div className="mt-2">
                  <MoneyText amount={plan.price} className="text-2xl font-bold text-slate-900 dark:text-slate-100" />
                  <span className="text-xs text-slate-500 ml-1">/ {plan.billingPeriod.toLowerCase()}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Min Quantity</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{plan.minQuantity}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Pausable</span>
                  {plan.pausable ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Closable</span>
                  {plan.closable ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Renewable</span>
                  {plan.renewable ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Auto Close</span>
                  {plan.autoClose ? (
                    <span className="text-amber-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

