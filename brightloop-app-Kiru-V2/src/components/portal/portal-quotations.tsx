"use client";

import { useState, useEffect } from "react";
import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import {
  FileText,
  CheckCircle,
  XCircle,
  Printer,
  Eye,
  Loader2,
  PenTool,
  ShieldCheck,
  Building,
  UserCheck,
  FileCheck2,
} from "lucide-react";
import type { PortalQuotation } from "./types";
import { Drawer } from "@/components/shared/drawer";
import { getDepartmentForProduct } from "@/lib/departments";

type Props = {
  onAcceptSuccess: () => void;
};

export function PortalQuotations({ onAcceptSuccess }: Props) {
  const [quotations, setQuotations] = useState<PortalQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<PortalQuotation | null>(null);
  const [signingQuote, setSigningQuote] = useState<PortalQuotation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Staff signing form states
  const [staffNameInput, setStaffNameInput] = useState("");
  const [signatureNotes, setSignatureNotes] = useState("");

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

  function openStaffSignModal(q: PortalQuotation) {
    const deptInfo = getDepartmentForProduct(q.productName, q.productCategory);
    setStaffNameInput(q.assignedStaffName || deptInfo.leadStaff);
    setSignatureNotes(`Approved in full by ${q.department || deptInfo.department}. Standard terms applicable.`);
    setSigningQuote(q);
  }

  async function handleStaffSign(quoteId: number) {
    if (!signingQuote) return;
    setActionLoading(true);
    setActionMessage(null);

    const deptInfo = getDepartmentForProduct(signingQuote.productName, signingQuote.productCategory);

    try {
      const res = await fetch(`/api/portal/quotations/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STAFF_SIGN",
          staffName: staffNameInput || deptInfo.leadStaff,
          department: signingQuote.department || deptInfo.department,
          notes: signatureNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Staff signing failed");
      }

      setActionMessage(data.message);
      setTimeout(() => {
        setSigningQuote(null);
        setSelectedQuote(null);
        fetchQuotations();
        onAcceptSuccess();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing staff signature";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(quoteId: number) {
    if (!confirm("Are you sure you want to reject this quotation?")) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/portal/quotations/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");

      setActionMessage("Quotation rejected and closed.");
      setTimeout(() => {
        setSelectedQuote(null);
        fetchQuotations();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error rejecting quotation";
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
            Formal quotations are routed to authorized staff according to product department. Once reviewed and digitally signed by department staff, the contract is provisioned and invoice is generated.
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
            Browse our software catalogue to request a quotation for your organization.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {quotations.map((q) => {
            const isPending = q.status === "QUOTATION";
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
                    <span className={`badge ${isPending ? "badge-warning" : STATUS_CLASS[q.status] || "badge-active"}`}>
                      {isPending ? "[PENDING STAFF SIGN-OFF]" : `[${q.status}]`}
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
                      <span>Assigned Staff: <strong style={{ color: "var(--text)" }}>{staffName}</strong></span>
                    </div>
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

                {/* Bottom Actions */}
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
                    <Eye size={14} /> Details
                  </button>

                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => openStaffSignModal(q)}
                      className="btn-primary"
                      style={{ padding: "0 12px", minHeight: 32, fontSize: "var(--text-xs)", gap: 6 }}
                    >
                      <PenTool size={13} />
                      Staff Sign & Accept
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontSize: "var(--text-xs)", fontWeight: 600 }}>
                      <ShieldCheck size={14} />
                      <span>Digitally Signed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Review & Digital Signing Modal */}
      {signingQuote && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 16,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: "1px solid var(--accent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--radius)",
                  background: "var(--accent)",
                  color: "var(--accent-contrast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PenTool size={20} />
              </div>
              <div>
                <h3 className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
                  Department Staff Sign-off
                </h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>
                  Quotation {signingQuote.number} • {signingQuote.productName}
                </p>
              </div>
            </div>

            {actionMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius)",
                  background: "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: "var(--success)",
                  fontSize: "var(--text-xs)",
                  marginBottom: 16,
                }}
              >
                {actionMessage}
              </div>
            )}

            <div
              style={{
                background: "var(--table-header)",
                borderRadius: "var(--radius)",
                padding: "12px",
                marginBottom: 16,
                fontSize: "var(--text-xs)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label" style={{ margin: 0 }}>Department:</span>
                <strong style={{ color: "var(--text)" }}>
                  {signingQuote.department || getDepartmentForProduct(signingQuote.productName).department}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label" style={{ margin: 0 }}>Plan & Total:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>
                  {signingQuote.planName} • {formatMoney(signingQuote.totalAmount)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label" style={{ margin: 0 }}>Department Policy:</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>
                  Complies with Standard Licensing Criteria
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStaffSign(signingQuote.id);
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <label className="label">Signing Staff Officer Name</label>
                <input
                  type="text"
                  value={staffNameInput}
                  onChange={(e) => setStaffNameInput(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="label">Department Authorization Notes</label>
                <textarea
                  value={signatureNotes}
                  onChange={(e) => setSignatureNotes(e.target.value)}
                  className="input"
                  rows={3}
                  style={{ resize: "none" }}
                  required
                />
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius)",
                  background: "color-mix(in srgb, var(--success) 10%, var(--panel))",
                  border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)",
                  marginBottom: 18,
                  fontSize: "0.75rem",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FileCheck2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                <span>
                  By signing, this department certifies the pricing, terms, and software provisioning entitlement.
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSigningQuote(null)}
                  className="btn-ghost"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                  style={{ gap: 6 }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> Approve & Digitally Sign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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

            {/* Department Card */}
            <div
              style={{
                background: "color-mix(in srgb, var(--accent) 8%, var(--panel))",
                border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                borderRadius: "var(--radius)",
                padding: "12px 14px",
                fontSize: "var(--text-xs)",
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
                Responsible Department: {selectedQuote.department || getDepartmentForProduct(selectedQuote.productName).department}
              </div>
              <div style={{ color: "var(--text-muted)" }}>
                Staff Lead: <strong style={{ color: "var(--text)" }}>{selectedQuote.assignedStaffName || getDepartmentForProduct(selectedQuote.productName).leadStaff}</strong>
              </div>
              {selectedQuote.isStaffSigned ? (
                <div style={{ marginTop: 6, color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={14} /> Digitally Signed & Authorized by Staff
                </div>
              ) : (
                <div style={{ marginTop: 6, color: "var(--warning)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <PenTool size={14} /> Awaiting Department Staff Digital Signature
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

            {/* Actions */}
            {selectedQuote.status === "QUOTATION" && (
              <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleReject(selectedQuote.id)}
                  disabled={actionLoading}
                  className="btn-danger"
                  style={{ minHeight: 36, padding: "0 14px", fontSize: "var(--text-xs)" }}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => openStaffSignModal(selectedQuote)}
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ minHeight: 36, padding: "0 16px", fontSize: "var(--text-xs)", gap: 6 }}
                >
                  <PenTool size={14} />
                  Staff Sign & Activate
                </button>
              </div>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}
