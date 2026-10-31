"use client";

import { useState } from "react";
import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import { Drawer } from "@/components/shared/drawer";
import { Pause, Play, XCircle, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { PortalSubscription } from "./types";

type Props = {
  subscription: PortalSubscription | null;
  onClose: () => void;
  onActionComplete: () => void;
};

export function PortalSubscriptionDrawer({ subscription, onClose, onActionComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!subscription) return null;

  async function handleAction(action: "PAUSE" | "RESUME" | "CANCEL") {
    if (!subscription) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/portal/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      onActionComplete();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update subscription";
      setError(message);
    } finally {
      setLoading(false);
      setConfirmCancel(false);
    }
  }

  const statusBadge = STATUS_CLASS[subscription.status] ?? "badge-draft";

  return (
    <Drawer open={!!subscription} onClose={onClose} title={`Subscription ${subscription.number}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>{subscription.productCategory}</span>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
              {subscription.productName}
            </h3>
          </div>
          <span className={`badge ${statusBadge}`}>
            [{subscription.status}]
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--danger) 12%, transparent)",
              color: "var(--danger)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Plan overview */}
        <div
          style={{
            padding: 16,
            borderRadius: "var(--radius)",
            background: "var(--table-header)",
            border: "1px solid var(--hairline)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: "var(--text-xs)",
          }}
        >
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Plan Name</span>
            <span style={{ fontWeight: 600 }}>{subscription.planName}</span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Billing Cycle</span>
            <span className="font-mono" style={{ fontWeight: 600 }}>
              {formatMoney(subscription.planPrice)} / {subscription.planBillingPeriod.toLowerCase()}
            </span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Start Date</span>
            <span className="font-mono">{formatDate(subscription.startDate)}</span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Next Billing</span>
            <span className="font-mono" style={{ fontWeight: 600, color: "var(--accent)" }}>
              {formatDate(subscription.nextBillingDate)}
            </span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Payment Terms</span>
            <span>{subscription.paymentTerms || "Standard (Immediate)"}</span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Contract Expiry</span>
            <span>{subscription.expiryDate ? formatDate(subscription.expiryDate) : "Auto-renewing"}</span>
          </div>
        </div>

        {/* Plan Capabilities / Rules */}
        <div>
          <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>
            Plan Terms & Rules
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className={`chip`} style={{ opacity: subscription.planPausable ? 1 : 0.5 }}>
              <CheckCircle size={12} color={subscription.planPausable ? "var(--success)" : "var(--text-muted)"} />
              {subscription.planPausable ? "Pausable by customer" : "Non-pausable"}
            </span>
            <span className={`chip`} style={{ opacity: subscription.planClosable ? 1 : 0.5 }}>
              <CheckCircle size={12} color={subscription.planClosable ? "var(--success)" : "var(--text-muted)"} />
              {subscription.planClosable ? "Closable anytime" : "Locked term"}
            </span>
            <span className={`chip`} style={{ opacity: subscription.planRenewable ? 1 : 0.5 }}>
              <CheckCircle size={12} color={subscription.planRenewable ? "var(--success)" : "var(--text-muted)"} />
              {subscription.planRenewable ? "Auto-renewable" : "Fixed term"}
            </span>
          </div>
        </div>

        {/* Line Items */}
        {subscription.lines.length > 0 && (
          <div>
            <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>
              Subscription Lines ({subscription.lines.length})
            </h4>
            <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
                <thead>
                  <tr style={{ background: "var(--table-header)", borderBottom: "1px solid var(--hairline)" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Product / Variant</th>
                    <th style={{ textAlign: "right", padding: "8px 12px" }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "8px 12px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {subscription.lines.map((l) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--hairline)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600 }}>{l.productName}</div>
                        {l.variantName && (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                            Variant: {l.variantName} {l.extraPrice ? `(+${formatMoney(l.extraPrice)})` : ""}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "right", padding: "10px 12px" }} className="font-mono">
                        {l.quantity}
                      </td>
                      <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600 }} className="font-mono">
                        {formatMoney(l.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subscription.notes && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            <span className="label" style={{ marginBottom: 2 }}>Notes</span>
            <p style={{ margin: 0 }}>{subscription.notes}</p>
          </div>
        )}

        {/* Self-service management actions */}
        <div style={{ marginTop: 12, borderTop: "1px solid var(--hairline)", paddingTop: 16 }}>
          <span className="label" style={{ marginBottom: 12 }}>Self-Service Actions</span>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Pause / Resume */}
            {subscription.status === "ACTIVE" && subscription.planPausable && (
              <button
                type="button"
                onClick={() => handleAction("PAUSE")}
                disabled={loading}
                className="btn-ghost"
                style={{ justifyContent: "flex-start", gap: 10, width: "100%" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Pause size={16} color="var(--warning)" />}
                <span>Pause Subscription</span>
              </button>
            )}

            {subscription.status === "PAUSED" && (
              <button
                type="button"
                onClick={() => handleAction("RESUME")}
                disabled={loading}
                className="btn-primary"
                style={{ justifyContent: "flex-start", gap: 10, width: "100%" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                <span>Resume Subscription</span>
              </button>
            )}

            {/* Cancel */}
            {subscription.status !== "CLOSED" && subscription.planClosable && (
              <>
                {!confirmCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    disabled={loading}
                    className="btn-danger"
                    style={{ justifyContent: "flex-start", gap: 10, width: "100%" }}
                  >
                    <XCircle size={16} />
                    <span>Cancel Subscription</span>
                  </button>
                ) : (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: "var(--radius)",
                      background: "color-mix(in srgb, var(--danger) 10%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--danger) 30%, transparent)",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    <p style={{ color: "var(--danger)", fontWeight: 600, margin: "0 0 8px" }}>
                      Are you sure you want to cancel {subscription.number}?
                    </p>
                    <p style={{ color: "var(--text-muted)", margin: "0 0 12px" }}>
                      You will retain access until the end of your prepaid period.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleAction("CANCEL")}
                        disabled={loading}
                        className="btn-danger"
                        style={{ padding: "0 12px", minHeight: 32 }}
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : "Yes, Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(false)}
                        disabled={loading}
                        className="btn-ghost"
                        style={{ padding: "0 12px", minHeight: 32 }}
                      >
                        Nevermind
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
