"use client";

import { useState, useEffect } from "react";
import { formatMoney, formatDate } from "@/lib/utils";
import {
  FileText,
  XCircle,
  Printer,
  Eye,
  Loader2,
  ShieldCheck,
  Building,
  UserCheck,
  Clock,
  CreditCard,
} from "lucide-react";
import type { PortalQuotation } from "./types";
import { Drawer } from "@/components/shared/drawer";
import { getDepartmentForProduct } from "@/lib/departments";

type Props = {
  onAcceptSuccess?: () => void;
  onPayInvoice?: () => void;
};

export function PortalQuotations({ onAcceptSuccess, onPayInvoice }: Props) {
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

  async function handleCancelRequest(quoteId: number) {
    if (!confirm("Are you sure you want to cancel this quotation request?")) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/portal/quotations/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      setActionMessage("Quotation request cancelled.");
      setTimeout(() => {
        setSelectedQuote(null);
        fetchQuotations();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling quotation";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: "var(--text-sm)" }}>Loading quotations & estimates...</p>
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
            Quotations & Department Approvals
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
            Customer Quotation Tracker — Generated quotations are routed to the assigned department staff lead. Once reviewed and digitally signed by authorized staff, your official tax invoice is generated for payment.
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
            Browse our software catalogue to request a new quotation for your enterprise.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {quotations.map((q) => {
            const isPending = q.status === "QUOTATION";
            const isSigned = q.status === "CONFIRMED" || q.status === "ACTIVE" || q.isStaffSigned;
            const deptInfo = getDepartmentForProduct(q.productName, q.productCategory);
            const department = q.department || deptInfo.department;
            const staffName = q.assignedStaffName || deptInfo.leadStaff;

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
                  border: isPending ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        {q.number}
                      </span>
                      <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "2px 0 0" }}>
                        {q.productName}
                      </h3>
                    </div>
                    <span className={`badge ${isPending ? "badge-warning" : "badge-active"}`}>
                      {isPending ? "PENDING STAFF SIGN-OFF" : "APPROVED & SIGNED"}
                    </span>
                  </div>

                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: "0 0 10px" }}>
                    Plan: <strong style={{ color: "var(--text)" }}>{q.planName}</strong> • {q.planBillingPeriod}
                  </p>

                  {/* Department & Staff Card */}
                  <div
                    style={{
                      background: "color-mix(in srgb, var(--accent) 7%, var(--panel))",
                      border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                      borderRadius: "var(--radius)",
                      padding: "10px 12px",
                      marginBottom: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", fontWeight: 600 }}>
                      <Building size={14} />
                      <span>{department}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                      <UserCheck size={14} />
                      <span>Assigned Staff Lead: <strong style={{ color: "var(--text)" }}>{staffName}</strong></span>
                    </div>

                    {isSigned ? (
                      <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, color: "var(--success)", fontWeight: 600 }}>
                        <ShieldCheck size={14} />
                        <span>Sign-off: {q.staffSignature || `SIG-${deptInfo.approvalCode}-${q.id}`}</span>
                      </div>
                    ) : (
                      <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, color: "var(--warning)", fontWeight: 600 }}>
                        <Clock size={14} />
                        <span>Awaiting digital signature by {staffName}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Box */}
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
                      <span className="label" style={{ marginBottom: 2 }}>Item Total</span>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--accent)" }}>
                        {formatMoney(q.totalAmount)}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className="label" style={{ marginBottom: 2 }}>Validity</span>
                      <span className="font-mono" style={{ fontWeight: 600 }}>
                        {formatDate(q.expiryDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions - STRICT CUSTOMER BOUNDARIES: NO SIGN/ACCEPT BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--hairline)",
                    paddingTop: 12,
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(q)}
                    className="btn-ghost"
                    style={{ padding: "0 10px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {isPending ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: "var(--warning)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        background: "color-mix(in srgb, var(--warning) 10%, transparent)",
                        padding: "6px 10px",
                        borderRadius: "var(--radius)",
                      }}
                      title="Only authorized department staff can review and sign this quotation"
                    >
                      <Clock size={13} />
                      <span>Pending Staff Review</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (onPayInvoice) onPayInvoice();
                        else if (onAcceptSuccess) onAcceptSuccess();
                      }}
                      className="btn-primary"
                      style={{ padding: "0 12px", minHeight: 32, fontSize: "var(--text-xs)", gap: 6 }}
                    >
                      <CreditCard size={13} />
                      Proceed to Pay Invoice
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
                <Printer size={14} /> Print Estimate
              </button>
            </div>

            {/* Department Responsibility Notice */}
            <div
              style={{
                background: "color-mix(in srgb, var(--accent) 8%, var(--panel))",
                border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                borderRadius: "var(--radius)",
                padding: "14px 16px",
                fontSize: "var(--text-xs)",
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
                Reviewing Department: {selectedQuote.department || getDepartmentForProduct(selectedQuote.productName).department}
              </div>
              <div style={{ color: "var(--text-muted)" }}>
                Assigned Staff Lead: <strong style={{ color: "var(--text)" }}>{selectedQuote.assignedStaffName || getDepartmentForProduct(selectedQuote.productName).leadStaff}</strong> ({selectedQuote.assignedStaffEmail || getDepartmentForProduct(selectedQuote.productName).email})
              </div>
              
              {selectedQuote.status === "QUOTATION" ? (
                <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: "var(--radius)", background: "color-mix(in srgb, var(--warning) 12%, transparent)", color: "var(--text)", lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--warning)" }}>Role Separation Notice:</strong> Only authorized staff from this department have the authority to digitally approve and sign this quotation. Once signed, your tax invoice will be generated and you may proceed with payment.
                </div>
              ) : (
                <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: "var(--radius)", background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--text)", lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--success)" }}>Quotation Approved:</strong> Digitally signed by {selectedQuote.assignedStaffName || "Department Staff"} with authorization code <code style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{selectedQuote.staffSignature || "SIG-AUTHORIZED"}</code>. Tax invoice is issued and ready for settlement.
                </div>
              )}
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

            {/* Actions - CUSTOMER ONLY CAN CANCEL REQUEST OR PROCEED TO INVOICE */}
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {selectedQuote.status === "QUOTATION" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleCancelRequest(selectedQuote.id)}
                    disabled={actionLoading}
                    className="btn-danger"
                    style={{ minHeight: 36, padding: "0 14px", fontSize: "var(--text-xs)" }}
                  >
                    <XCircle size={14} /> Cancel Request
                  </button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--warning)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      padding: "0 12px",
                    }}
                  >
                    <Clock size={14} />
                    <span>Awaiting Staff Digital Signature</span>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuote(null);
                    if (onPayInvoice) onPayInvoice();
                    else if (onAcceptSuccess) onAcceptSuccess();
                  }}
                  className="btn-primary"
                  style={{ minHeight: 36, padding: "0 16px", fontSize: "var(--text-xs)", gap: 6 }}
                >
                  <CreditCard size={14} />
                  Proceed to Pay Real-Time Invoice
                </button>
              )}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
