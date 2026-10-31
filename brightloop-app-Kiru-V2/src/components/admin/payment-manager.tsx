"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { formatDate, formatMoney } from "@/lib/utils";
import { PAYMENT_STATUSES, PAYMENT_METHODS } from "@/lib/validation";

type PaymentRow = { id: number; invoiceId: number; customerId: number | null; amount: string; method: string; status: string; paidOn: string; transactionRef: string | null; failureReason: string | null; note: string | null };
type InvoiceOption = { id: number; number: string; customerId: number; total: string; amountPaid: string };
type CustomerOption = { id: number; name: string; email: string; companyName: string | null };

const STATUS_BADGE: Record<string, string> = {
  SUCCESS: "badge-active",
  FAILED: "badge-overdue",
  PENDING: "badge-warning",
};

export function PaymentManager() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ invoiceId: "", amount: "", method: "BANK_TRANSFER", paidOn: new Date().toISOString().slice(0, 10), note: "", reference: "" });

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (methodFilter) params.set("method", methodFilter);
    const res = await fetch(`/api/payments?${params.toString()}`);
    const data = await res.json();
    setPayments(data.payments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, methodFilter]);

  useEffect(() => {
    fetch("/api/invoices").then((r) => r.json()).then((d) => setInvoices(d.invoices ?? []));
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, []);

  function customerLabel(id: number | null) {
    if (!id) return "—";
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}${c.companyName ? ` (${c.companyName})` : ""}` : `#${id}`;
  }

  function invoiceOutstanding(invoiceId: string) {
    const inv = invoices.find((i) => String(i.id) === invoiceId);
    if (!inv) return null;
    return Number(inv.total) - Number(inv.amountPaid);
  }

  async function submitManualPayment() {
    setFormError(null);
    if (!form.invoiceId || !form.amount) {
      setFormError("Invoice and amount are required");
      return;
    }
    const res = await fetch("/api/payments/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId: Number(form.invoiceId),
        amount: form.amount,
        method: form.method,
        paidOn: form.paidOn,
        note: form.note || undefined,
        reference: form.reference || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error ?? "Something went wrong");
      return;
    }
    setDrawerOpen(false);
    setForm({ invoiceId: "", amount: "", method: "BANK_TRANSFER", paidOn: new Date().toISOString().slice(0, 10), note: "", reference: "" });
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select className="input" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 180 }} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={() => { setFormError(null); setDrawerOpen(true); }}>Record manual payment</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : payments.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No payments recorded yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Date</th><th>Customer</th><th>Method</th><th>Reference</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="ledger-row">
                  <td data-label="Date" className="font-mono" style={{ padding: "10px 0" }}>{formatDate(p.paidOn)}</td>
                  <td data-label="Customer">{customerLabel(p.customerId)}</td>
                  <td data-label="Method">{p.method}</td>
                  <td data-label="Reference" className="font-mono">{p.transactionRef ?? "—"}</td>
                  <td data-label="Amount" className="font-mono">{formatMoney(p.amount)}</td>
                  <td data-label="Status">
                    <span className={`badge ${STATUS_BADGE[p.status] ?? "badge-draft"}`}>[{p.status}]</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Record manual payment">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label">Invoice</label>
            <select className="input" value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}>
              <option value="">Select invoice…</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.number} — {customerLabel(inv.customerId)}</option>
              ))}
            </select>
            {form.invoiceId && invoiceOutstanding(form.invoiceId) !== null && (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                Outstanding: {formatMoney(invoiceOutstanding(form.invoiceId) ?? 0)}
              </p>
            )}
          </div>
          <div>
            <label className="label">Amount</label>
            <input className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Method</label>
            <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date paid</label>
            <input className="input" type="date" value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} />
          </div>
          <div>
            <label className="label">Reference (optional)</label>
            <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={submitManualPayment}>Record payment</button>
        </div>
      </Drawer>
    </div>
  );
}
