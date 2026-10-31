"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoneyText } from "@/components/shared/money-text";
import { Sparkles } from "lucide-react";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/discounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.discounts) setDiscounts(data.discounts);
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
            Discount Rules
          </h1>
          <p className="text-sm text-slate-500">
            Volume breaks, fixed coupons, and promotional percentages selected automatically by the billing engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading discounts...</div>
        ) : discounts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No discounts configured yet.</div>
        ) : (
          discounts.map((discount) => (
            <Card key={discount.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {discount.type}
                  </span>
                  <Sparkles className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-lg mt-3">{discount.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">
                  {discount.type === "PERCENTAGE" ? (
                    `${discount.value}% Off`
                  ) : (
                    <MoneyText amount={discount.value} />
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {discount.minQuantity ? (
                    <div>Min Quantity: <span className="font-semibold text-slate-800 dark:text-slate-200">{discount.minQuantity}</span></div>
                  ) : null}
                  {discount.usageLimit ? (
                    <div>Limit: <span className="font-semibold text-slate-800 dark:text-slate-200">{discount.timesUsed} / {discount.usageLimit} uses</span></div>
                  ) : (
                    <div>Unlimited uses</div>
                  )}
                  {discount.endDate ? (
                    <div>Valid until: <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(discount.endDate).toLocaleDateString("en-IN")}</span></div>
                  ) : (
                    <div>No expiry date</div>
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
