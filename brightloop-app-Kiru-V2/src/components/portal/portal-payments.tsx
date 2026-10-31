"use client";

import { formatMoney, formatDate } from "@/lib/utils";
import { ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react";
import type { PortalPayment } from "./types";

type Props = {
  payments: PortalPayment[];
  totalPaid: string;
};

export function PortalPayments({ payments, totalPaid }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary Banner */}
      <div
        className="panel"
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "linear-gradient(135deg, color-mix(in srgb, var(--success) 8%, var(--panel)), var(--panel))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--success) 15%, transparent)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="label" style={{ margin: 0 }}>Verified Settlements</span>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              {formatMoney(totalPaid)}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          {payments.length} successful payment transaction{payments.length === 1 ? "" : "s"} recorded
        </div>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="panel" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <CreditCard size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", margin: 0 }}>
            No payment records found yet.
          </p>
        </div>
      ) : (
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
              <thead>
                <tr style={{ background: "var(--table-header)", borderBottom: "1px solid var(--hairline)" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Applied Invoice</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Method</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Reference / Memo</th>
                  <th style={{ textAlign: "right", padding: "12px 16px" }}>Amount Paid</th>
                  <th style={{ textAlign: "center", padding: "12px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="ledger-row">
                    <td style={{ padding: "14px 16px", fontWeight: 600 }} className="font-mono">
                      {formatDate(p.paidOn)}
                    </td>
                    <td style={{ padding: "14px 16px" }} className="font-mono">
                      {p.invoiceNumber}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className="chip" style={{ fontSize: "0.6875rem" }}>
                        {p.method}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                      {p.note || "Portal settlement"}
                    </td>
                    <td
                      style={{ textAlign: "right", padding: "14px 16px", fontWeight: 700, color: "var(--success)" }}
                      className="font-mono"
                    >
                      {formatMoney(p.amount)}
                    </td>
                    <td style={{ textAlign: "center", padding: "14px 16px" }}>
                      <span className="badge badge-paid" style={{ gap: 4 }}>
                        <CheckCircle2 size={12} /> Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
