"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import { FileText, Play, CheckCircle2, Printer } from "lucide-react";
import { toast } from "sonner";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [runningBilling, setRunningBilling] = React.useState(false);

  const fetchInvoices = () => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRunBilling = async () => {
    setRunningBilling(true);
    try {
      const res = await fetch("/api/admin/run-billing", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to run billing");
      toast.success(data.message || `Billing run complete! ${data.invoicesCreated} invoices generated.`);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute billing engine");
    } finally {
      setRunningBilling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Invoices
          </h1>
          <p className="text-sm text-slate-500">
            Manage billing runs, generated invoices, and payment confirmations.
          </p>
        </div>

        <Button
          onClick={handleRunBilling}
          isLoading={runningBilling}
          className="gap-2 shadow-sm"
        >
          <Play className="h-4 w-4" /> Run Billing Now
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Period</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading invoices...</td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No invoices generated yet.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {inv.number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{inv.customer?.name}</div>
                        <div className="text-xs text-slate-400">{inv.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <DateText date={inv.periodStart} /> - <DateText date={inv.periodEnd} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <DateText date={inv.dueDate} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <MoneyText amount={inv.grandTotal} className="font-semibold text-slate-900 dark:text-slate-100" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/invoices/${inv.id}/print`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-medium p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print
                        </Link>
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
