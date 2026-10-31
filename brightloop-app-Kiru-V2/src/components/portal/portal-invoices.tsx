"use client";

import { useState } from "react";
import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import { Search, FileText, CreditCard, Eye } from "lucide-react";
import type { PortalInvoice } from "./types";

type Props = {
  invoices: PortalInvoice[];
  onViewInvoice: (inv: PortalInvoice) => void;
  onPayInvoice: (inv: PortalInvoice) => void;
};

export function PortalInvoices({ invoices, onViewInvoice, onPayInvoice }: Props) {
  const [filter, setFilter] = useState<"ALL" | "UNPAID" | "PAID">("ALL");
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((inv) => {
    const balanceDue = parseFloat(inv.balanceDue || "0");
    const isPaid = inv.status === "PAID" || balanceDue <= 0.01;

    let matchesFilter = true;
    if (filter === "UNPAID") matchesFilter = !isPaid;
    if (filter === "PAID") matchesFilter = isPaid;

    const matchesSearch =
      search === "" ||
      inv.number.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, maxWidth: 360 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by invoice # (e.g. INV-1001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 36, minHeight: 38, fontSize: "var(--text-xs)" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "ALL", label: `All (${invoices.length})` },
            {
              id: "UNPAID",
              label: `Unpaid (${invoices.filter((i) => parseFloat(i.balanceDue) > 0.01).length})`,
            },
            {
              id: "PAID",
              label: `Paid (${invoices.filter((i) => i.status === "PAID" || parseFloat(i.balanceDue) <= 0.01).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as "ALL" | "UNPAID" | "PAID")}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                border: filter === tab.id ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                background: filter === tab.id ? "color-mix(in srgb, var(--accent) 12%, var(--panel))" : "var(--panel)",
                color: filter === tab.id ? "var(--text)" : "var(--text-muted)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List / Table */}
      {filtered.length === 0 ? (
        <div
          className="panel"
          style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}
        >
          <FileText size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", margin: 0 }}>
            No invoices found for this selection.
          </p>
        </div>
      ) : (
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
              <thead>
                <tr style={{ background: "var(--table-header)", borderBottom: "1px solid var(--hairline)" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Invoice</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Period</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Due Date</th>
                  <th style={{ textAlign: "right", padding: "12px 16px" }}>Total</th>
                  <th style={{ textAlign: "right", padding: "12px 16px" }}>Balance Due</th>
                  <th style={{ textAlign: "center", padding: "12px 16px" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "12px 16px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const balanceDue = parseFloat(inv.balanceDue || "0");
                  const statusBadge = inv.isOverdue
                    ? "badge-overdue"
                    : STATUS_CLASS[inv.status] ?? "badge-draft";

                  return (
                    <tr key={inv.id} className="ledger-row">
                      {/* Invoice # */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          onClick={() => onViewInvoice(inv)}
                          className="font-mono"
                          style={{
                            fontWeight: 700,
                            color: "var(--text)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {inv.number}
                        </span>
                      </td>

                      {/* Period */}
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                        {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontWeight: inv.isOverdue ? 700 : 500,
                            color: inv.isOverdue ? "var(--danger)" : "var(--text)",
                          }}
                        >
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: "right", padding: "14px 16px" }} className="font-mono">
                        {formatMoney(inv.total)}
                      </td>

                      {/* Balance Due */}
                      <td
                        style={{
                          textAlign: "right",
                          padding: "14px 16px",
                          fontWeight: 700,
                          color: balanceDue > 0.01 ? "var(--danger)" : "var(--success)",
                        }}
                        className="font-mono"
                      >
                        {formatMoney(balanceDue)}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: "center", padding: "14px 16px" }}>
                        <span className={`badge ${statusBadge}`}>
                          {inv.isOverdue ? "[OVERDUE]" : `[${inv.status}]`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right", padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => onViewInvoice(inv)}
                            className="btn-ghost"
                            style={{ padding: "0 10px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
                            title="View Receipt"
                          >
                            <Eye size={13} /> View
                          </button>

                          {balanceDue > 0.01 && inv.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => onPayInvoice(inv)}
                              className="btn-primary"
                              style={{ padding: "0 12px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
                            >
                              <CreditCard size={13} /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
