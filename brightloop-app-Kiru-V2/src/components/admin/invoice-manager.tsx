"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { formatDate, formatMoney } from "@/lib/utils";
import { INVOICE_STATUSES } from "@/lib/validation";

type CustomerOption = { id: number; name: string; email: string; companyName: string | null };
type InvoiceRow = {
  id: number;
  number: string;
  customerId: number;
  subscriptionId: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string | null;
  total: string;
  amountPaid: string;
  createdAt: string;
};
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

export function InvoiceManager({ canRunBilling }: { canRunBilling: boolean }) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [numberSearch, setNumberSearch] = useState("");
  const [detail, setDetail] = useState<{ invoice: InvoiceRow & Record<string, unknown>; lines: InvoiceLineRow[] } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingPreview, setBillingPreview] = useState<{ count: number; previews: { subscriptionId: number; total: string }[] } | null>(null);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (overdueOnly) params.set("overdue", "true");
    if (numberSearch) params.set("number", numberSearch);
    const res = await fetch(`/api/invoices?${params.toString()}`);
    const data = await res.json();
    setInvoices(data.invoices ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, overdueOnly, numberSearch]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, []);

  function customerLabel(id: number) {
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}${c.companyName ? ` (${c.companyName})` : ""}` : `#${id}`;
  }

  async function openDetail(id: number) {
    setActionError(null);
    setReason("");
    const res = await fetch(`/api/invoices/${id}`);
    setDetail(await res.json());
  }

  async function cancelInvoice(id: number) {
    setActionError(null);
    const res = await fetch(`/api/invoices/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error ?? "Something went wrong");
      return;
    }
    await openDetail(id);
    await load();
  }

  async function previewBilling() {
    setBillingBusy(true);
    setBillingResult(null);
    const res = await fetch("/api/billing/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dryRun: true }) });
    const data = await res.json();
    setBillingBusy(false);
    setBillingPreview(data);
  }

  async function runBilling() {
    setBillingBusy(true);
    const res = await fetch("/api/billing/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const data = await res.json();
    setBillingBusy(false);
    setBillingPreview(null);
    setBillingResult(`Created ${data.created} invoice(s), skipped ${data.skipped}, failed ${data.failed}.`);
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {canRunBilling && (
        <div className="panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="label" style={{ margin: 0 }}>Automated billing</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" disabled={billingBusy} onClick={previewBilling}>Preview run</button>
              <button className="btn-primary" disabled={billingBusy} onClick={runBilling}>Run billing now</button>
            </div>
          </div>
          {billingPreview && (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              {billingPreview.count} subscription(s) due — total to invoice: {formatMoney(billingPreview.previews.reduce((sum, p) => sum + Number(p.total), 0))}
            </p>
          )}
          {billingResult && <p style={{ fontSize: "var(--text-sm)" }}>{billingResult}</p>}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select className="input" style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input className="input" style={{ width: 200 }} placeholder="Search invoice number" value={numberSearch} onChange={(e) => setNumberSearch(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
          <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
          Overdue only
        </label>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : invoices.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No invoices yet. Invoices are generated automatically by the billing engine from active subscriptions.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Number</th><th>Customer</th><th>Period</th><th>Due date</th><th>Total</th><th>Outstanding</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => openDetail(inv.id)}>
                  <td data-label="Number" className="font-mono" style={{ padding: "10px 0" }}>{inv.number}</td>
                  <td data-label="Customer">{customerLabel(inv.customerId)}</td>
                  <td data-label="Period" className="font-mono">{formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}</td>
                  <td data-label="Due date" className="font-mono">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                  <td data-label="Total" className="font-mono">{formatMoney(inv.total)}</td>
                  <td data-label="Outstanding" className="font-mono">{formatMoney(Number(inv.total) - Number(inv.amountPaid))}</td>
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
            {actionError && <div className="badge badge-overdue" style={{ width: "100%" }}>{actionError}</div>}
            <span className={`badge ${STATUS_BADGE[detail.invoice.status as string] ?? "badge-draft"}`} style={{ width: "fit-content" }}>
              [{detail.invoice.status as string}]
            </span>
            <div><p className="label">Customer</p><p>{customerLabel(detail.invoice.customerId as number)}</p></div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div><p className="label">Period</p><p className="font-mono">{formatDate(detail.invoice.periodStart as string)} – {formatDate(detail.invoice.periodEnd as string)}</p></div>
              <div><p className="label">Due date</p><p className="font-mono">{detail.invoice.dueDate ? formatDate(detail.invoice.dueDate as string) : "—"}</p></div>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div><p className="label">Total</p><p className="font-mono">{formatMoney(detail.invoice.total as string)}</p></div>
              <div><p className="label">Paid</p><p className="font-mono">{formatMoney(detail.invoice.amountPaid as string)}</p></div>
              <div><p className="label">Outstanding</p><p className="font-mono">{formatMoney(Number(detail.invoice.total) - Number(detail.invoice.amountPaid))}</p></div>
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
            {detail.invoice.status === "CONFIRMED" && (
              <>
                <div>
                  <label className="label">Cancellation reason (optional)</label>
                  <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <button className="btn-danger" onClick={() => cancelInvoice(detail.invoice.id as number)}>Cancel invoice</button>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
