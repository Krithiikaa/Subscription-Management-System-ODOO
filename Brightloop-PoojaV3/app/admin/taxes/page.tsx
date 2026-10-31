"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Percent } from "lucide-react";

export default function AdminTaxesPage() {
  const [taxes, setTaxes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/taxes")
      .then((res) => res.json())
      .then((data) => {
        if (data.taxes) setTaxes(data.taxes);
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
            Tax Rates
          </h1>
          <p className="text-sm text-slate-500">
            GST and jurisdiction tax percentages applied to invoices automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading taxes...</div>
        ) : taxes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No taxes configured yet.</div>
        ) : (
          taxes.map((tax) => (
            <Card key={tax.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Active
                  </span>
                  <Percent className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-xl mt-3">{tax.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">
                  {tax.percentage}%
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Automatically calculated on net line amounts.
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
