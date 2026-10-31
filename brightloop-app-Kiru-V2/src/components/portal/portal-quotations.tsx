"use client";

import { useState, useEffect } from "react";
import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import { FileText, CheckCircle, XCircle, Printer, Eye, Loader2 } from "lucide-react";
import type { PortalQuotation } from "./types";
import { Drawer } from "@/components/shared/drawer";

type Props = {
  onAcceptSuccess: () => void;
};

export function PortalQuotations({ onAcceptSuccess }: Props) {
  const [quotations, setQuotations] = useState<PortalQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<PortalQuotation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function fetchQuotations() {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/quotations");
      if (res.ok) {
        const json = await res.json();
        setQuotations(json.quotations || []);
      }
    } catch (err) {
      console.error("Error loading quotations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotations();
  }, []);

  async function handleQuoteAction(quoteId: number, action: "ACCEPT" | "REJECT") {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/portal/quotations/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setActionMessage(data.message);
      setTimeout(() => {
        setSelectedQuote(null);
        fetchQuotations();
        onAcceptSuccess();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing quotation";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: "var(--text-sm)" }}>Loading quotations...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        className="panel"
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 4px" }}>
            My Quotations & Estimates
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
            Review formal proposals, itemized prices, and terms. Accepting a quotation immediately provisions the
            subscription contract and generates the initial invoice.
          </p>
        </div>
      </div>

      {quotations.length === 0 ? (
        <div className="panel" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
            No Active Quotations
          </h3>
          <p style={{ fontSize: "var(--text-xs)", margin: 0 }}>
            Explore our software catalogue to generate an instant quotation proposal.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {quotations.map((q) => {
            const isPending = q.status === "QUOTATION";

            return (
              <div
                key={q.id}
                className="panel"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        {q.number}
                      </span>
                      <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "2px 0 0" }}>
                        {q.productName}
                      </h3>
                    </div>
                    <span className={`badge ${isPending ? "badge-warning" : STATUS_CLASS[q.status] || "badge-draft"}`}>
                      [{q.status}]
                    </span>
                  </div>

                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: "0 0 12px" }}>
                    Plan: <strong style={{ color: "var(--text)" }}>{q.planName}</strong> • {q.planBillingPeriod}
                  </p>

                  <div
                    style={{
                      background: "var(--table-header)",
                      borderRadius: "var(--radius)",
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    <div>
                      <span className="label" style={{ marginBottom: 2 }}>Estimated Amount</span>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--accent)" }}>
                        {formatMoney(q.totalAmount)}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className="label" style={{ marginBottom: 2 }}>Valid Until</span>
                      <span className="font-mono" style={{ fontWeight: 600 }}>
                        {formatDate(q.expiryDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--hairline)",
                    paddingTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(q)}
                    className="btn-ghost"
                    style={{ padding: "0 10px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
                  >
                    <Eye size={14} /> Review Details
                  </button>

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleQuoteAction(q.id, "ACCEPT")}
                      disabled={actionLoading}
                      className="btn-primary"
                      style={{ padding: "0 14px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
                    >
                      <CheckCircle size={14} /> Accept & Sign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quotation Detail Drawer */}
      {selectedQuote && (
        <Drawer
          open={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Quotation ${selectedQuote.number}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {actionMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius)",
                  background: "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: "var(--success)",
                  fontSize: "var(--text-xs)",
                }}
              >
                {actionMessage}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="label" style={{ marginBottom: 2 }}>{selectedQuote.productCategory}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
                  {selectedQuote.productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-ghost"
                style={{ padding: "0 10px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
              >
                <Printer size={14} /> Print
              </button>
            </div>

            {/* Meta */}
            <div
              style={{
                background: "var(--table-header)",
                borderRadius: "var(--radius)",
                padding: "12px 14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                fontSize: "var(--text-xs)",
              }}
            >
              <div>
                <span className="label" style={{ marginBottom: 2 }}>Issued Date</span>
                <span className="font-mono">{formatDate(selectedQuote.startDate)}</span>
              </div>
              <div>
                <span className="label" style={{ marginBottom: 2 }}>Validity Expiry</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{formatDate(selectedQuote.expiryDate)}</span>
              </div>
              <div>
                <span className="label" style={{ marginBottom: 2 }}>Selected Plan</span>
                <span>{selectedQuote.planName} ({selectedQuote.planBillingPeriod})</span>
              </div>
              <div>
                <span className="label" style={{ marginBottom: 2 }}>Payment Terms</span>
                <span>{selectedQuote.paymentTerms || "Net 15"}</span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <span className="label" style={{ marginBottom: 8 }}>Itemized Quotation Lines</span>
              <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
                  <thead>
                    <tr style={{ background: "var(--table-header)", borderBottom: "1px solid var(--hairline)" }}>
                      <th style={{ textAlign: "left", padding: "8px 10px" }}>Item</th>
                      <th style={{ textAlign: "right", padding: "8px 10px" }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "8px 10px" }}>Rate</th>
                      <th style={{ textAlign: "right", padding: "8px 10px" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.lines.map((l) => (
                      <tr key={l.id} style={{ borderBottom: "1px solid var(--hairline)" }}>
                        <td style={{ padding: "10px" }}>
                          <div style={{ fontWeight: 600 }}>{l.productName}</div>
                          {l.variantName && (
                            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                              Variant: {l.variantName}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: "right", padding: "10px" }} className="font-mono">{l.quantity}</td>
                        <td style={{ textAlign: "right", padding: "10px" }} className="font-mono">{formatMoney(l.unitPrice)}</td>
                        <td style={{ textAlign: "right", padding: "10px", fontWeight: 700 }} className="font-mono">{formatMoney(l.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {selectedQuote.notes && (
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                <span className="label" style={{ marginBottom: 2 }}>Terms & Notes</span>
                <p style={{ margin: 0 }}>{selectedQuote.notes}</p>
              </div>
            )}

            {/* Actions */}
            {selectedQuote.status === "QUOTATION" && (
              <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleQuoteAction(selectedQuote.id, "REJECT")}
                  disabled={actionLoading}
                  className="btn-danger"
                  style={{ minHeight: 36, padding: "0 14px", fontSize: "var(--text-xs)" }}
                >
                  <XCircle size={14} /> Reject Quotation
                </button>
                <button
                  type="button"
                  onClick={() => handleQuoteAction(selectedQuote.id, "ACCEPT")}
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ minHeight: 36, padding: "0 16px", fontSize: "var(--text-xs)" }}
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Accept & Activate Subscription
                </button>
              </div>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}
