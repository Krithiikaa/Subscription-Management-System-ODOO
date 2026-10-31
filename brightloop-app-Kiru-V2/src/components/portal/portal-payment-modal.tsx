"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import type { PortalInvoice } from "./types";

type Props = {
  invoice: PortalInvoice;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

export function PortalPaymentModal({ invoice, onClose, onSuccess }: Props) {
  const balanceDue = parseFloat(invoice.balanceDue);
  const [payAmount, setPayAmount] = useState(invoice.balanceDue);
  const [method, setMethod] = useState<"UPI" | "CARD" | "BANK_TRANSFER" | "OTHER">("UPI");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [txnRef, setTxnRef] = useState<string>("");

  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // NetBanking bank selection
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // UPI VPA state
  const [customVpa, setCustomVpa] = useState("");

  const UPI_VPA = "brightloop.pay@icici";

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  }

  function formatCardNumber(val: string) {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(\d{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please specify a valid payment amount greater than zero.");
      setLoading(false);
      return;
    }

    if (amountNum > balanceDue + 0.01) {
      setError(`Payment cannot exceed outstanding balance of ${formatMoney(balanceDue)}.`);
      setLoading(false);
      return;
    }

    const generatedTxn = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch(`/api/portal/invoices/${invoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          method,
          note: note.trim() || `Online Settlement - ${method} (Ref: ${generatedTxn})`,
          idempotencyKey: generatedTxn,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment transaction could not be authorized");
      }

      setTxnRef(generatedTxn);
      setSuccess(true);
      setTimeout(async () => {
        await onSuccess();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment processing error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: 24,
          position: "relative",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.35)",
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

        {/* Security Header Badge */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "var(--radius)",
            background: "color-mix(in srgb, var(--success) 12%, var(--panel))",
            border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)",
            color: "var(--success)",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Lock size={14} />
            <span>256-bit SSL Encrypted • Instant Real-Time Settlement</span>
          </div>
          <span style={{ fontSize: "0.6875rem", opacity: 0.85 }}>PCI-DSS Level 1</span>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "28px 16px" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--success) 15%, transparent)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircle2 size={38} />
            </div>
            <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 6 }}>
              Payment Settled Successfully!
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 16px" }}>
              {formatMoney(parseFloat(payAmount))} has been confirmed and applied to Invoice {invoice.number}.
            </p>

            <div
              style={{
                background: "var(--table-header)",
                borderRadius: "var(--radius)",
                padding: "12px",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                textAlign: "left",
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Transaction ID:</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{txnRef}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Method:</span>
                <span style={{ fontWeight: 600 }}>{method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Cleared Status:</span>
                <span style={{ color: "var(--success)", fontWeight: 700 }}>PAID & CLEARED</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{ width: "100%", padding: "10px 0" }}
            >
              Close & View Updated Invoice
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="badge badge-warning">Invoice Settlement</span>
                <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {invoice.number}
                </span>
              </div>
              <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "2px 0 4px" }}>
                Instant Invoice Payment
              </h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                Total: <strong style={{ color: "var(--text)" }}>{formatMoney(invoice.total)}</strong> • Outstanding Balance:{" "}
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
              <label className="label">Payment Channel</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
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
                    fontSize: "0.75rem",
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
                    fontSize: "0.75rem",
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
                    fontSize: "0.75rem",
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
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  <Wallet size={18} color={method === "OTHER" ? "var(--accent)" : "var(--text-muted)"} />
                  <span>Corporate Wallet</span>
                </button>
              </div>
            </div>

            {/* Real-time Payment Method Specific Fields */}
            {method === "UPI" && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  fontSize: "var(--text-xs)",
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    Official Corporate UPI ID (VPA)
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--panel)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--accent)" }}>
                      {UPI_VPA}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(UPI_VPA)}
                      className="btn-ghost"
                      style={{ padding: "0 8px", minHeight: 28, fontSize: "0.7rem", gap: 4 }}
                    >
                      {copiedVpa ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                      {copiedVpa ? "Copied" : "Copy VPA"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Or Enter Your VPA / UPI App</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank"
                    value={customVpa}
                    onChange={(e) => setCustomVpa(e.target.value)}
                    className="input"
                    style={{ fontSize: "var(--text-xs)" }}
                  />
                </div>
              </div>
            )}

            {method === "CARD" && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  fontSize: "var(--text-xs)",
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <label className="label">Card Number</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="input font-mono"
                    maxLength={19}
                  />
                </div>

                <div>
                  <label className="label">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="NAME ON CARD"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label className="label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="input font-mono"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="label">CVV / CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                      className="input font-mono"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "BANK_TRANSFER" && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  fontSize: "var(--text-xs)",
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <label className="label">Select Corporate Bank</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { id: "HDFC", name: "HDFC Bank" },
                    { id: "ICICI", name: "ICICI Bank" },
                    { id: "SBI", name: "State Bank of India" },
                    { id: "AXIS", name: "Axis Bank" },
                    { id: "KOTAK", name: "Kotak Mahindra" },
                    { id: "PNB", name: "Punjab National Bank" },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "var(--radius)",
                        border: selectedBank === bank.id ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                        background: selectedBank === bank.id ? "color-mix(in srgb, var(--accent) 10%, var(--panel))" : "var(--panel)",
                        cursor: "pointer",
                        fontWeight: selectedBank === bank.id ? 700 : 500,
                        fontSize: "0.75rem",
                        textAlign: "left",
                      }}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === "OTHER" && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  fontSize: "var(--text-xs)",
                  marginBottom: 16,
                }}
              >
                <label className="label">Select Corporate Wallet</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {["PhonePe Business", "Paytm Corporate", "Amazon Pay Business"].map((w) => (
                    <button
                      key={w}
                      type="button"
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--hairline)",
                        background: "var(--panel)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            <div style={{ marginBottom: 18 }}>
              <label className="label">Payment Reference / Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input"
                placeholder="e.g. Recurring subscription clearance"
              />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: 160 }}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Authorizing...
                  </>
                ) : (
                  `Pay ${formatMoney(parseFloat(payAmount) || 0)} Now`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
