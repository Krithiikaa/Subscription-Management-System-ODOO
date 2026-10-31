"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Printer, FileText, ArrowRight } from "lucide-react";

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            My Invoices & Statements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Download receipts, print tax statements, and review outstanding balances.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-60 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800" />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices generated yet"
          description="Invoices will automatically appear here on your scheduled billing dates."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Billing Period</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {inv.number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <DateText date={inv.periodStart} /> – <DateText date={inv.periodEnd} />
                      </td>
                      <td className="py-3.5 px-4">
                        <DateText date={inv.dueDate} />
                        {inv.isOverdue && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.isOverdue ? "OVERDUE" : inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        <MoneyText amount={inv.grandTotal} />
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        {inv.balance > 0 ? (
                          <MoneyText amount={inv.balance} colored className="font-bold text-red-600" />
                        ) : (
                          <span className="text-emerald-600 font-medium">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link href={`/invoices/${inv.id}/print`}>
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / PDF</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

