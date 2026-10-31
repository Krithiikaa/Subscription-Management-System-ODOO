"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { StepperTimeline } from "@/components/shared/stepper-timeline";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import { ArrowLeft, Pause, Play, XCircle, RotateCw } from "lucide-react";

export default function CustomerSubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [sub, setSub] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadSub = React.useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.subscriptions || []).find((s: any) => s.id === id);
        if (found) setSub(found);
        else setError("Subscription not found or access denied.");
      })
      .catch((err) => setError("Failed to load subscription details."))
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    loadSub();
  }, [loadSub]);

  const handleTransition = async (toStatus: string, note?: string) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/subscriptions/${id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      loadSub();
    } catch (err: any) {
      setError(err.message || "Action not permitted on this plan");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading subscription details...</div>;
  }

  if (error || !sub) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-red-600 font-semibold">{error || "Subscription not found"}</p>
        <Button onClick={() => router.push("/portal/subscriptions")} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subscriptions
        </Button>
      </div>
    );
  }

  const isPaused = sub.status === "PAUSED";
  const isActive = sub.status === "ACTIVE";
  const isClosed = sub.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button
            onClick={() => router.push("/portal/subscriptions")}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all subscriptions
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              {sub.plan.name}
            </h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {sub.number}
            </span>
            <StatusBadge status={sub.status} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Two Column Layout (Section 6 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lines Table & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Products & Inclusions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 pb-2">
                      <th className="py-2.5">Product & Variant</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Price</th>
                      <th className="py-2.5 text-right">Tax</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {sub.lines.map((l: any) => (
                      <tr key={l.id}>
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                          <div>{l.productName}</div>
                          {l.variantName && (
                            <div className="text-[11px] text-slate-400 font-normal">
                              {l.variantName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-center tabular-nums">{l.quantity}</td>
                        <td className="py-3 text-right tabular-nums">
                          <MoneyText amount={l.unitPrice} />
                        </td>
                        <td className="py-3 text-right tabular-nums text-slate-400">
                          {l.taxRate}%
                        </td>
                        <td className="py-3 text-right tabular-nums font-semibold">
                          <MoneyText amount={l.amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 dark:border-slate-800 font-bold">
                      <td colSpan={4} className="py-3 text-right text-slate-700 dark:text-slate-300">
                        Total Recurring Charge:
                      </td>
                      <td className="py-3 text-right text-base text-indigo-600 dark:text-indigo-400">
                        <MoneyText amount={sub.totalAmount} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Vertical Stepper Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle & Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <StepperTimeline currentStatus={sub.status} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary Card & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <StatusBadge status={sub.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Period:</span>
                  <span className="font-semibold uppercase">{sub.plan.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Start Date:</span>
                  <DateText date={sub.startDate} className="font-medium" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Invoice Date:</span>
                  <DateText date={sub.nextInvoiceDate} className="font-medium" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expiry Date:</span>
                  <DateText date={sub.expiryDate} className="font-medium" />
                </div>
              </div>

              {/* Action Buttons with Flag Enforcement Tooltips */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                {/* Pause / Resume Button */}
                {isActive && (
                  <div>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                      disabled={!sub.plan.pausable || actionLoading}
                      onClick={() => handleTransition("PAUSED", "Paused by customer via portal")}
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause Subscription
                    </Button>
                    {!sub.plan.pausable && (
                      <p className="text-[11px] text-slate-400 text-center mt-1">
                        * Plan terms do not allow pausing
                      </p>
                    )}
                  </div>
                )}

                {isPaused && (
                  <Button
                    variant="primary"
                    className="w-full justify-center gap-2"
                    isLoading={actionLoading}
                    onClick={() => handleTransition("ACTIVE", "Resumed by customer")}
                  >
                    <Play className="w-3.5 h-3.5" /> Resume Subscription
                  </Button>
                )}

                {/* Close Button */}
                {!isClosed && (
                  <div>
                    <Button
                      variant="destructive"
                      className="w-full justify-center gap-2"
                      disabled={!sub.plan.closable || actionLoading}
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this subscription? Closed subscriptions cannot be reopened.")) {
                          handleTransition("CLOSED", "Cancelled by customer via portal");
                        }
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Close Subscription
                    </Button>
                    {!sub.plan.closable && (
                      <p className="text-[11px] text-slate-400 text-center mt-1">
                        * Plan terms do not allow early cancellation
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

