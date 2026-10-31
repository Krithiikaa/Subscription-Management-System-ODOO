"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { EditableLine, EMPTY_LINE, LineItemsEditor, linesToPayload, validateLines } from "@/components/admin/line-items-editor";
import { formatDate, formatMoney } from "@/lib/utils";
import { QUOTATION_STATUSES } from "@/lib/validation";

type CustomerOption = { id: number; name: string; email: string; companyName: string | null };
type TemplateOption = { id: number; name: string };

type QuotationRow = {
  id: number;
  number: string;
  customerId: number;
  status: string;
  quotationDate: string;
  validUntil: string | null;
  grandTotal: string;
  currency: string;
};

type QuotationLineRow = {
  id: number;
  productName: string;
  variantName: string | null;
  planName: string;
  billingPeriod: string;
  quantity: number;
  unitPrice: string;
  variantExtra: string;
  taxRatePct: string;
  taxAmount: string;
  discountAmount: string;
  subtotal: string;
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

export function QuotationManager({ role }: { role: "ADMIN" | "STAFF" }) {
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<{ quotation: QuotationRow & Record<string, unknown>; lines: QuotationLineRow[] } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([{ ...EMPTY_LINE }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadQuotations() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/quotations?${params.toString()}`);
    const data = await res.json();
    setQuotations(data.quotations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadQuotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
    if (role === "ADMIN") {
      fetch("/api/quotation-templates").then((r) => r.json()).then((d) => setTemplates(d.templates ?? []));
    }
  }, [role]);

  function customerLabel(id: number) {
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}${c.companyName ? ` (${c.companyName})` : ""}` : `#${id}`;
  }

  async function onSelectTemplate(id: string) {
    setTemplateId(id);
    if (!id) return;
    const res = await fetch(`/api/quotation-templates/${id}`);
    const data = await res.json();
    if (data.template?.defaultPaymentTerms) setPaymentTerms(data.template.defaultPaymentTerms);
    const mapped: EditableLine[] = (data.lines ?? []).map((l: { productId: number; variantId: number | null; planId: number }) => ({
      productId: l.productId,
      variantId: l.variantId ?? "",
      planId: l.planId,
      quantity: 1,
      taxRuleId: "",
      discountId: "",
      description: "",
    }));
    if (mapped.length > 0) setLines(mapped);
  }

  async function openDetail(id: number) {
    setActionError(null);
    const res = await fetch(`/api/quotations/${id}`);
    const data = await res.json();
    setDetail(data);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const lineError = validateLines(lines);
    if (lineError) {
      setFormError(lineError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(customerId),
          templateId: templateId ? Number(templateId) : undefined,
          paymentTerms: paymentTerms || undefined,
          currency: "INR",
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          termsAndConditions: termsAndConditions || undefined,
          lines: linesToPayload(lines),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      setCustomerId("");
      setTemplateId("");
      setPaymentTerms("");
      setValidUntil("");
      setNotes("");
      setTermsAndConditions("");
      setLines([{ ...EMPTY_LINE }]);
      setCreateOpen(false);
      await loadQuotations();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function runAction(path: string) {
    setActionError(null);
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error ?? "Something went wrong");
      return;
    }
    if (detail) await openDetail(detail.quotation.id as number);
    await loadQuotations();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <select className="input" style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {QUOTATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ New quotation</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : quotations.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No quotations yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Number</th>
                <th>Customer</th>
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
                  <td data-label="Customer">{customerLabel(q.customerId)}</td>
                  <td data-label="Date" className="font-mono">{formatDate(q.quotationDate)}</td>
                  <td data-label="Valid until" className="font-mono">{q.validUntil ? formatDate(q.validUntil) : "—"}</td>
                  <td data-label="Total" className="font-mono">{formatMoney(q.grandTotal)}</td>
                  <td data-label="Status">
                    <span className={`badge ${STATUS_BADGE[q.status] ?? "badge-draft"}`}>[{q.status}]</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New quotation">
        <form onSubmit={onCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label">Customer</label>
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          {role === "ADMIN" && templates.length > 0 && (
            <div>
              <label className="label">Start from template (optional)</label>
              <select className="input" value={templateId} onChange={(e) => onSelectTemplate(e.target.value)}>
                <option value="">No template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Payment terms</label>
              <input className="input" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g. Due within 15 days" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Valid until</label>
              <input type="date" className="input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div>
            <label className="label">Terms and conditions</label>
            <textarea className="input" value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} />
          </div>
          <p className="label">Lines</p>
          <LineItemsEditor lines={lines} onChange={setLines} />
          <button type="submit" className="btn-primary" disabled={submitting || !customerId}>{submitting ? "Creating…" : "Create quotation"}</button>
        </form>
      </Drawer>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? (detail.quotation.number as string) : ""}>
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {actionError && <div className="badge badge-overdue" style={{ width: "100%" }}>{actionError}</div>}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className={`badge ${STATUS_BADGE[detail.quotation.status as string] ?? "badge-draft"}`}>[{detail.quotation.status as string}]</span>
              <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                {detail.quotation.validUntil ? `Valid until ${formatDate(detail.quotation.validUntil as string)}` : "No expiry set"}
              </span>
            </div>
            <div>
              <p className="label">Customer</p>
              <p>{customerLabel(detail.quotation.customerId as number)}</p>
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
                      {l.taxAmount !== "0.00" && ` · Tax ${l.taxRatePct}% (${formatMoney(l.taxAmount)})`}
                      {l.discountAmount !== "0.00" && ` · Discount -${formatMoney(l.discountAmount)}`}
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {detail.quotation.status === "DRAFT" && (
                <button className="btn-primary" onClick={() => runAction(`/api/quotations/${detail.quotation.id}/send`)}>Send to customer</button>
              )}
              {detail.quotation.status === "ACCEPTED" && !detail.quotation.convertedSubscriptionId && (
                <button className="btn-primary" onClick={() => runAction(`/api/quotations/${detail.quotation.id}/convert`)}>Convert to subscription</button>
              )}
              {!!detail.quotation.convertedSubscriptionId && (
                <span className="badge badge-active">[CONVERTED]</span>
              )}
              <button className="btn-ghost" onClick={() => runAction(`/api/quotations/${detail.quotation.id}/duplicate`)}>Duplicate</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
