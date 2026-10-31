"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Drawer } from "@/components/shared/drawer";
import { formatDate, formatMoney } from "@/lib/utils";

type InvoiceRow = { id: number; number: string; subscriptionId: number; status: string; periodStart: string; periodEnd: string; dueDate: string | null; total: string; amountPaid: string };
type InvoiceLineRow = { id: number; productName: string | null; variantName: string | null; planName: string | null; billingPeriod: string | null; quantity: number; unitPrice: string; lineTotal: string };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-draft",
  CONFIRMED: "badge-confirmed",
  PARTIALLY_PAID: "badge-warning",
  PAID: "badge-active",
  CANCELLED: "badge-closed",
};

function isOverdue(inv: InvoiceRow): boolean {
  if (inv.status !== "CONFIRMED" && inv.status !== "PARTIALLY_PAID") return false;
  if (!inv.dueDate) return false;
  const outstanding = Number(inv.total) - Number(inv.amountPaid);
  if (outstanding <= 0) return false;
  return inv.dueDate < new Date().toISOString().slice(0, 10);
}

export function MyInvoices() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ invoice: InvoiceRow & Record<string, unknown>; lines: InvoiceLineRow[] } | null>(null);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id: number) {
    const res = await fetch(`/api/invoices/${id}`);
    setDetail(await res.json());
  }

  function outstanding(inv: InvoiceRow | (InvoiceRow & Record<string, unknown>)) {
    return Number(inv.total) - Number(inv.amountPaid);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : invoices.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No invoices yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Number</th><th>Period</th><th>Due date</th><th>Total</th><th>Outstanding</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => openDetail(inv.id)}>
                  <td data-label="Number" className="font-mono" style={{ padding: "10px 0" }}>{inv.number}</td>
                  <td data-label="Period" className="font-mono">{formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}</td>
                  <td data-label="Due date" className="font-mono">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                  <td data-label="Total" className="font-mono">{formatMoney(inv.total)}</td>
                  <td data-label="Outstanding" className="font-mono">{formatMoney(outstanding(inv))}</td>
                  <td data-label="Status">
                    <span className={`badge ${STATUS_BADGE[inv.status] ?? "badge-draft"}`}>[{inv.status}]</span>
                    {isOverdue(inv) && <span className="badge badge-overdue" style={{ marginLeft: 6 }}>[OVERDUE]</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? (detail.invoice.number as string) : ""}>
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className={`badge ${STATUS_BADGE[detail.invoice.status as string] ?? "badge-draft"}`} style={{ width: "fit-content" }}>
              [{detail.invoice.status as string}]
            </span>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div><p className="label">Period</p><p className="font-mono">{formatDate(detail.invoice.periodStart as string)} – {formatDate(detail.invoice.periodEnd as string)}</p></div>
              <div><p className="label">Due date</p><p className="font-mono">{detail.invoice.dueDate ? formatDate(detail.invoice.dueDate as string) : "—"}</p></div>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div><p className="label">Total</p><p className="font-mono">{formatMoney(detail.invoice.total as string)}</p></div>
              <div><p className="label">Paid</p><p className="font-mono">{formatMoney(detail.invoice.amountPaid as string)}</p></div>
              <div><p className="label">Outstanding</p><p className="font-mono">{formatMoney(outstanding(detail.invoice))}</p></div>
            </div>
            <div>
              <p className="label">Lines</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {detail.lines.map((l) => (
                  <div key={l.id} className="panel" style={{ padding: 10, fontSize: "var(--text-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                      <span>{l.productName}{l.variantName ? ` — ${l.variantName}` : ""}</span>
                      <span className="font-mono">{formatMoney(l.lineTotal)}</span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                      {l.planName} ({l.billingPeriod}) · Qty {l.quantity} · Unit {formatMoney(l.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {outstanding(detail.invoice) > 0 && (detail.invoice.status === "CONFIRMED" || detail.invoice.status === "PARTIALLY_PAID") && (
              <Link href={`/portal/checkout/new?invoiceId=${detail.invoice.id}`} className="btn-primary" style={{ textAlign: "center" }}>
                Pay Now
              </Link>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
