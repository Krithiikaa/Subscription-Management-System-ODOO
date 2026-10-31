"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { formatDate, formatMoney } from "@/lib/utils";

type QuotationRow = {
  id: number;
  number: string;
  status: string;
  quotationDate: string;
  validUntil: string | null;
  grandTotal: string;
};

type QuotationLineRow = {
  id: number;
  productName: string;
  variantName: string | null;
  planName: string;
  billingPeriod: string;
  quantity: number;
  unitPrice: string;
  taxRatePct: string;
  taxAmount: string;
  discountAmount: string;
  lineTotal: string;
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-draft",
  SENT: "badge-warning",
  ACCEPTED: "badge-active",
  REJECTED: "badge-overdue",
  EXPIRED: "badge-closed",
  CANCELLED: "badge-closed",
};

export function MyQuotations() {
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ quotation: QuotationRow & Record<string, unknown>; lines: QuotationLineRow[] } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"accept" | "reject" | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/quotations");
    const data = await res.json();
    setQuotations(data.quotations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(id: number) {
    setActionError(null);
    setConfirming(null);
    const res = await fetch(`/api/quotations/${id}`);
    const data = await res.json();
    setDetail(data);
  }

  async function respond(action: "accept" | "reject") {
    if (!detail) return;
    setActionError(null);
    const res = await fetch(`/api/quotations/${detail.quotation.id}/${action}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error ?? "Something went wrong");
      return;
    }
    setConfirming(null);
    await openDetail(detail.quotation.id as number);
    await load();
  }

  if (loading) return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>;

  if (quotations.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>You have no quotations yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="panel" style={{ padding: 24 }}>
        <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
              <th style={{ padding: "8px 0" }}>Number</th>
              <th>Date</th>
              <th>Valid until</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => openDetail(q.id)}>
                <td data-label="Number" className="font-mono" style={{ padding: "10px 0" }}>{q.number}</td>
                <td data-label="Date" className="font-mono">{formatDate(q.quotationDate)}</td>
                <td data-label="Valid until" className="font-mono">{q.validUntil ? formatDate(q.validUntil) : "—"}</td>
                <td data-label="Total" className="font-mono">{formatMoney(q.grandTotal)}</td>
                <td data-label="Status"><span className={`badge ${STATUS_BADGE[q.status] ?? "badge-draft"}`}>[{q.status}]</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? (detail.quotation.number as string) : ""}>
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {actionError && <div className="badge badge-overdue" style={{ width: "100%" }}>{actionError}</div>}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className={`badge ${STATUS_BADGE[detail.quotation.status as string] ?? "badge-draft"}`}>[{detail.quotation.status as string}]</span>
              <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                {detail.quotation.validUntil ? `Valid until ${formatDate(detail.quotation.validUntil as string)}` : ""}
              </span>
            </div>
            <div>
              <p className="label">Products</p>
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
            <div className="font-mono" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{formatMoney(detail.quotation.subtotal as string)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><span>-{formatMoney(detail.quotation.discountTotal as string)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tax</span><span>+{formatMoney(detail.quotation.taxTotal as string)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid var(--hairline)", paddingTop: 4 }}>
                <span>Grand total</span><span>{formatMoney(detail.quotation.grandTotal as string)}</span>
              </div>
            </div>
            {!!detail.quotation.paymentTerms && (
              <div><p className="label">Payment terms</p><p style={{ fontSize: "var(--text-sm)" }}>{detail.quotation.paymentTerms as string}</p></div>
            )}
            {!!detail.quotation.termsAndConditions && (
              <div><p className="label">Terms and conditions</p><p style={{ fontSize: "var(--text-sm)", whiteSpace: "pre-wrap" }}>{detail.quotation.termsAndConditions as string}</p></div>
            )}

            {detail.quotation.status === "SENT" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {confirming === null && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={() => setConfirming("accept")}>Accept quotation</button>
                    <button className="btn-ghost" onClick={() => setConfirming("reject")}>Reject quotation</button>
                  </div>
                )}
                {confirming === "accept" && (
                  <div className="panel" style={{ padding: 14 }}>
                    <p style={{ fontSize: "var(--text-sm)", marginBottom: 10 }}>Confirm you accept this quotation at the terms shown above?</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-primary" onClick={() => respond("accept")}>Yes, accept</button>
                      <button className="btn-ghost" onClick={() => setConfirming(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                {confirming === "reject" && (
                  <div className="panel" style={{ padding: 14 }}>
                    <p style={{ fontSize: "var(--text-sm)", marginBottom: 10 }}>Confirm you want to reject this quotation?</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-danger" onClick={() => respond("reject")}>Yes, reject</button>
                      <button className="btn-ghost" onClick={() => setConfirming(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
