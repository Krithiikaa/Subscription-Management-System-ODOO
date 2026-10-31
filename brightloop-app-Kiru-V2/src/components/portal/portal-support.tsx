"use client";

import { useState } from "react";
import { Mail, Phone, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import type { PortalSubscription, PortalInvoice } from "./types";

type Props = {
  subscriptions: PortalSubscription[];
  invoices: PortalInvoice[];
};

export function PortalSupport({ subscriptions, invoices }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [referenceType, setReferenceType] = useState<"GENERAL" | "SUBSCRIPTION" | "INVOICE">("GENERAL");
  const [referenceId, setReferenceId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    ticketNumber: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTicketResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/portal/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          priority,
          referenceType,
          referenceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setTicketResult({
        ticketNumber: data.ticketNumber,
        message: data.message,
      });
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error contacting support";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
      {/* Left: Support Form */}
      <div className="panel" style={{ padding: "28px" }}>
        <div style={{ marginBottom: 20 }}>
          <span className="label" style={{ marginBottom: 4 }}>Helpdesk & Technical Inquiry</span>
          <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 6px" }}>
            Submit a Support Request
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
            Our enterprise solutions team is on standby to assist with subscription changes, custom integrations, or billing reconciliation.
          </p>
        </div>

        {ticketResult && (
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--success) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--success) 35%, transparent)",
              color: "var(--success)",
              fontSize: "var(--text-xs)",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: 4 }}>
              <CheckCircle2 size={18} /> Ticket Registered: {ticketResult.ticketNumber}
            </div>
            <p style={{ margin: 0, color: "var(--text)" }}>{ticketResult.message}</p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--danger) 12%, transparent)",
              color: "var(--danger)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Reference selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label">Reference Category</label>
              <select
                className="input"
                value={referenceType}
                onChange={(e) => {
                  setReferenceType(e.target.value as "GENERAL" | "SUBSCRIPTION" | "INVOICE");
                  setReferenceId("");
                }}
              >
                <option value="GENERAL">General Support</option>
                <option value="SUBSCRIPTION">Regarding Subscription</option>
                <option value="INVOICE">Regarding Invoice</option>
              </select>
            </div>

            <div>
              <label className="label">Reference Item</label>
              {referenceType === "SUBSCRIPTION" ? (
                <select
                  className="input"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                >
                  <option value="">Select Subscription</option>
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.number}>
                      {s.number} - {s.productName}
                    </option>
                  ))}
                </select>
              ) : referenceType === "INVOICE" ? (
                <select
                  className="input"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                >
                  <option value="">Select Invoice</option>
                  {invoices.map((i) => (
                    <option key={i.id} value={i.number}>
                      {i.number} ({i.status})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value="N/A (General)"
                  className="input"
                  style={{ opacity: 0.6, background: "var(--table-header)" }}
                />
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="label">Priority Level</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["LOW", "NORMAL", "HIGH", "URGENT"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "var(--radius)",
                    border: priority === p ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                    background: priority === p ? "color-mix(in srgb, var(--accent) 12%, var(--panel))" : "var(--panel)",
                    color: priority === p ? "var(--text)" : "var(--text-muted)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="label">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
              placeholder="e.g. Plan upgrade request or Billing question"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="label">Detailed Explanation</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input"
              placeholder="Provide as much context as possible to expedite resolution..."
              rows={4}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Support Ticket"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right: Support Contact Info & SLA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="panel" style={{ padding: "24px" }}>
          <h4 className="font-serif" style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "0 0 16px" }}>
            Support Contacts & SLAs
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: "var(--text-xs)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                <Mail size={18} />
              </div>
              <div>
                <span className="label" style={{ marginBottom: 1 }}>Direct Support Email</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>support@brightloop.io</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                <Phone size={18} />
              </div>
              <div>
                <span className="label" style={{ marginBottom: 1 }}>Toll-Free Customer Care</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>+91 800 BRIGHTLOOP (274448)</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius)",
                  background: "var(--table-header)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <span className="label" style={{ marginBottom: 1 }}>Service Level Agreement</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>Guaranteed 4-hour initial response</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="panel"
          style={{
            padding: "20px",
            background: "var(--table-header)",
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
          }}
        >
          <span className="label" style={{ marginBottom: 4 }}>Self-Service Tip</span>
          <p style={{ margin: 0 }}>
            Need to pause or cancel a subscription? You can do so directly from your Subscriptions workspace under
            &ldquo;Self-Service Actions&rdquo; if your plan permits.
          </p>
        </div>
      </div>
    </div>
  );
}
