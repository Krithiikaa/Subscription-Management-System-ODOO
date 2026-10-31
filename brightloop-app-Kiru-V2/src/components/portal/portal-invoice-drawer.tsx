"use client";

import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import { Drawer } from "@/components/shared/drawer";
import { Printer, CreditCard, ShieldCheck } from "lucide-react";
import type { PortalInvoice, PortalCustomer } from "./types";

type Props = {
  invoice: PortalInvoice | null;
  customer: PortalCustomer | null;
  onClose: () => void;
  onPayNow: (invoice: PortalInvoice) => void;
};

export function PortalInvoiceDrawer({ invoice, customer, onClose, onPayNow }: Props) {
  if (!invoice) return null;

  const balanceDue = parseFloat(invoice.balanceDue);
  const statusBadge = invoice.isOverdue
    ? "badge-overdue"
    : STATUS_CLASS[invoice.status] ?? "badge-draft";

  return (
    <Drawer open={!!invoice} onClose={onClose} title={`Invoice ${invoice.number}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Actions bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className={`badge ${statusBadge}`}>
            {invoice.isOverdue ? "[OVERDUE]" : `[${invoice.status}]`}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-ghost"
              style={{ padding: "0 12px", minHeight: 36, fontSize: "var(--text-xs)" }}
            >
              <Printer size={14} /> Print / PDF
            </button>
            {balanceDue > 0.01 && invoice.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => onPayNow(invoice)}
                className="btn-primary"
                style={{ padding: "0 14px", minHeight: 36, fontSize: "var(--text-xs)" }}
              >
                <CreditCard size={14} /> Pay {formatMoney(balanceDue)}
              </button>
            )}
          </div>
        </div>

        {/* Invoice Meta Panel */}
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
            <span className="label" style={{ marginBottom: 2 }}>Billing Period</span>
            <span className="font-mono" style={{ fontWeight: 600 }}>
              {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
            </span>
          </div>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Payment Due Date</span>
            <span
              className="font-mono"
              style={{
                fontWeight: 600,
                color: invoice.isOverdue ? "var(--danger)" : "var(--text)",
              }}
            >
              {formatDate(invoice.dueDate)}
            </span>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span className="label" style={{ marginBottom: 2 }}>Billed To</span>
            <p style={{ fontWeight: 600, color: "var(--text)", margin: 0 }}>
              {customer?.companyName || customer?.name}
            </p>
            {customer?.address && (
              <p style={{ color: "var(--text-muted)", margin: "2px 0 0" }}>
                {customer.address}
              </p>
            )}
            {customer?.phone && (
              <p style={{ color: "var(--text-muted)", margin: "2px 0 0" }}>
                Tel: {customer.phone}
              </p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>
            Line Items ({invoice.lines.length})
          </h4>
          <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
              <thead>
                <tr style={{ background: "var(--table-header)", borderBottom: "1px solid var(--hairline)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Item</th>
                  <th style={{ textAlign: "right", padding: "8px 12px" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "8px 12px" }}>Rate</th>
                  <th style={{ textAlign: "right", padding: "8px 12px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600 }}>{l.productName}</div>
                      {l.variantName && (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                          Variant: {l.variantName} (+{formatMoney(l.variantExtra)})
                        </div>
                      )}
                      {parseFloat(l.taxRatePct) > 0 && (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                          GST: {l.taxRatePct}% ({formatMoney(l.taxAmount)})
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px" }} className="font-mono">
                      {l.quantity}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px" }} className="font-mono">
                      {formatMoney(l.unitPrice)}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600 }} className="font-mono">
                      {formatMoney(l.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--radius)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: "var(--text-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>Subtotal</span>
            <span className="font-mono">{formatMoney(invoice.subtotal)}</span>
          </div>

          {parseFloat(invoice.discountAmount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
              <span>Discount</span>
              <span className="font-mono">-{formatMoney(invoice.discountAmount)}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>Applicable Taxes</span>
            <span className="font-mono">{formatMoney(invoice.taxAmount)}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: "var(--text-base)",
              paddingTop: 8,
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <span>Total Amount</span>
            <span className="font-mono" style={{ color: "var(--accent)" }}>
              {formatMoney(invoice.total)}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>Amount Paid</span>
            <span className="font-mono" style={{ color: "var(--success)", fontWeight: 600 }}>
              {formatMoney(invoice.amountPaid)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              color: balanceDue > 0.01 ? "var(--danger)" : "var(--success)",
              paddingTop: 4,
            }}
          >
            <span>Balance Due</span>
            <span className="font-mono">{formatMoney(balanceDue)}</span>
          </div>
        </div>

        {/* Payments linked to this invoice */}
        {invoice.payments.length > 0 && (
          <div>
            <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>
              Recorded Payments ({invoice.payments.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--table-header)",
                    borderRadius: "var(--radius)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <ShieldCheck size={14} color="var(--success)" />
                      {p.method} • {formatDate(p.paidOn)}
                    </div>
                    {p.note && <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: 2 }}>{p.note}</div>}
                  </div>
                  <span className="font-mono" style={{ fontWeight: 700, color: "var(--success)" }}>
                    {formatMoney(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
