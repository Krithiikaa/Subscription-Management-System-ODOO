"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoneyText } from "@/components/shared/money-text";
import { FileSpreadsheet, Clock } from "lucide-react";

export default function AdminQuotationTemplatesPage() {
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/quotation-templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
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
            Quotation Templates
          </h1>
          <p className="text-sm text-slate-500">
            Predefined subscription packages with preset validity and line items.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No quotation templates configured yet.</div>
        ) : (
          templates.map((tpl) => (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {tpl.validityDays} Days Validity
                  </span>
                  <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-lg mt-3">{tpl.name}</CardTitle>
                <p className="text-xs text-slate-500">Plan: {tpl.plan?.name} ({tpl.plan?.billingPeriod})</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Included Line Items
                </span>
                <div className="space-y-2">
                  {tpl.lines.map((line: any) => (
                    <div key={line.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{line.productName}</div>
                        {line.variantName && <div className="text-[10px] text-slate-400">{line.variantName}</div>}
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 mr-2">Qty {line.quantity}</span>
                        <MoneyText amount={line.unitPrice} className="font-semibold text-slate-900 dark:text-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

