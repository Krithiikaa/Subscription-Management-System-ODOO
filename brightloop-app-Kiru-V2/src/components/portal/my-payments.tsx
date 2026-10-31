"use client";

import { useEffect, useState } from "react";
import { formatDate, formatMoney } from "@/lib/utils";

type PaymentRow = { id: number; invoiceId: number; amount: string; method: string; status: string; paidOn: string; transactionRef: string | null; failureReason: string | null };

const STATUS_BADGE: Record<string, string> = {
  SUCCESS: "badge-active",
  FAILED: "badge-overdue",
  PENDING: "badge-warning",
};

export function MyPayments() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel" style={{ padding: 24 }}>
      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
      ) : payments.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No payments yet.</p>
      ) : (
        <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
              <th style={{ padding: "8px 0" }}>Date</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="ledger-row">
                <td data-label="Date" className="font-mono" style={{ padding: "10px 0" }}>{formatDate(p.paidOn)}</td>
                <td data-label="Method">{p.method}</td>
                <td data-label="Reference" className="font-mono">{p.transactionRef ?? "—"}</td>
                <td data-label="Amount" className="font-mono">{formatMoney(p.amount)}</td>
                <td data-label="Status">
                  <span className={`badge ${STATUS_BADGE[p.status] ?? "badge-draft"}`}>[{p.status}]</span>
                  {p.status === "FAILED" && p.failureReason && (
                    <span style={{ marginLeft: 8, color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{p.failureReason}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
