"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import { CreditCard, QrCode, Building2, Wallet, CheckCircle2, AlertCircle, X, Loader2, ShieldAlert } from "lucide-react";
import type { PortalInvoice } from "./types";

type PaymentModalProps = {
  invoice: PortalInvoice;
  onClose: () => void;
  onSuccess: (updatedInvoice: PortalInvoice) => void;
};

export function PortalPaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const balanceDue = parseFloat(invoice.balanceDue);
  const [payAmount, setPayAmount] = useState<string>(invoice.balanceDue);
  const [method, setMethod] = useState<"UPI" | "CARD" | "BANK_TRANSFER" | "OTHER">("UPI");
  const [note, setNote] = useState<string>("Online payment via portal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (amountNum > balanceDue + 0.01) {
      setError(`Amount cannot exceed the balance due of ${formatMoney(balanceDue)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/portal/invoices/${invoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          method: method === "OTHER" ? "OTHER" : method,
          note: `[DEMO PAYMENT] ${note}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess(data.invoice);
        onClose();
      }, 1400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment could not be processed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 100,
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "24px",
          position: "relative",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Demo Mode Notice */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "var(--radius)",
            background: "color-mix(in srgb, var(--accent) 15%, var(--panel))",
            border: "1px solid var(--accent)",
            color: "var(--text)",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <ShieldAlert size={16} color="var(--accent)" />
          <span>
            <strong>DEMO MODE:</strong> Simulated Payment Gateway for Hackathon Evaluation. No real funds are transferred.
          </span>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: "0 auto 16px" }} />
            <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8 }}>
              Simulated Payment Successful!
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              {formatMoney(parseFloat(payAmount))} has been recorded against {invoice.number}.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <div style={{ marginBottom: 16 }}>
              <span className="badge badge-warning" style={{ marginBottom: 6 }}>
                Settle Invoice
              </span>
              <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "2px 0 4px" }}>
                Pay Invoice {invoice.number}
              </h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                Total: <strong style={{ color: "var(--text)" }}>{formatMoney(invoice.total)}</strong> • Balance due:{" "}
                <strong style={{ color: "var(--danger)" }}>{formatMoney(invoice.balanceDue)}</strong>
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: "var(--radius)",
                  background: "color-mix(in srgb, var(--danger) 12%, transparent)",
                  color: "var(--danger)",
                  fontSize: "var(--text-xs)",
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Amount */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">Amount to Pay (INR)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="input font-mono"
                  style={{ fontSize: "var(--text-base)", fontWeight: 600 }}
                  required
                />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setPayAmount(invoice.balanceDue)}
                  style={{ whiteSpace: "nowrap", padding: "0 12px", fontSize: "var(--text-xs)" }}
                >
                  Pay Full Balance
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">Select Simulated Payment Method</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setMethod("UPI")}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 6px",
                    borderRadius: "var(--radius)",
                    border: method === "UPI" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    background: method === "UPI" ? "color-mix(in srgb, var(--accent) 10%, var(--panel))" : "var(--panel)",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  <QrCode size={18} color={method === "UPI" ? "var(--accent)" : "var(--text-muted)"} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("CARD")}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 6px",
                    borderRadius: "var(--radius)",
                    border: method === "CARD" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    background: method === "CARD" ? "color-mix(in srgb, var(--accent) 10%, var(--panel))" : "var(--panel)",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  <CreditCard size={18} color={method === "CARD" ? "var(--accent)" : "var(--text-muted)"} />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("BANK_TRANSFER")}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 6px",
                    borderRadius: "var(--radius)",
                    border: method === "BANK_TRANSFER" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    background:
                      method === "BANK_TRANSFER"
                        ? "color-mix(in srgb, var(--accent) 10%, var(--panel))"
                        : "var(--panel)",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  <Building2 size={18} color={method === "BANK_TRANSFER" ? "var(--accent)" : "var(--text-muted)"} />
                  <span>NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("OTHER")}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 6px",
                    borderRadius: "var(--radius)",
                    border: method === "OTHER" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    background:
                      method === "OTHER"
                        ? "color-mix(in srgb, var(--accent) 10%, var(--panel))"
                        : "var(--panel)",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  <Wallet size={18} color={method === "OTHER" ? "var(--accent)" : "var(--text-muted)"} />
                  <span>Wallet</span>
                </button>
              </div>
            </div>

            {/* Simulated gateway details */}
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius)",
                background: "var(--table-header)",
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              {method === "UPI" && (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>UPI Instant Flow</p>
                  <p style={{ margin: 0 }}>Simulated fast VPA response: brightloop@okaxis</p>
                </div>
              )}
              {method === "CARD" && (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>Mock Card Terminal</p>
                  <p style={{ margin: 0 }}>Simulated 3D-Secure test authorization with instant settlement.</p>
                </div>
              )}
              {method === "BANK_TRANSFER" && (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>Corporate NetBanking Simulation</p>
                  <p style={{ margin: 0 }}>Direct bank clearing test against invoice {invoice.number}.</p>
                </div>
              )}
              {method === "OTHER" && (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>Digital Wallet Gateway</p>
                  <p style={{ margin: 0 }}>Paytm / AmazonPay simulated balance debit.</p>
                </div>
              )}
            </div>

            {/* Note */}
            <div style={{ marginBottom: 18 }}>
              <label className="label">Payment Memo / Reference (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input"
                placeholder="e.g. October subscription settlement"
              />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  `Authorize ${formatMoney(parseFloat(payAmount) || 0)}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
