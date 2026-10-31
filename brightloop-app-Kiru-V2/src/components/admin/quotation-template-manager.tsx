"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/shared/drawer";
import { EditableLine, EMPTY_LINE, LineItemsEditor, linesToPayload, validateLines } from "@/components/admin/line-items-editor";
import { formatDate } from "@/lib/utils";

type TemplateRow = {
  id: number;
  name: string;
  description: string | null;
  validityDays: number;
  defaultPaymentTerms: string | null;
  active: boolean;
  createdAt: string;
};

export function QuotationTemplateManager() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/quotation-templates");
    const data = await res.json();
    setTemplates(data.templates ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function duplicate(id: number) {
    await fetch(`/api/quotation-templates/${id}/duplicate`, { method: "POST" });
    await load();
  }

  async function toggleActive(t: TemplateRow) {
    await fetch(`/api/quotation-templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
    await load();
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const lineError = validateLines(lines);
    if (lineError) {
      setError(lineError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotation-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, validityDays, defaultPaymentTerms: defaultPaymentTerms || undefined, lines: linesToPayload(lines) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setName("");
      setDescription("");
      setValidityDays(30);
      setDefaultPaymentTerms("");
      setLines([{ ...EMPTY_LINE }]);
      setCreateOpen(false);
      await load();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ New template</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : templates.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No templates yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Name</th>
                <th>Validity</th>
                <th>Payment terms</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="ledger-row">
                  <td data-label="Name" style={{ padding: "10px 0" }}>{t.name}</td>
                  <td data-label="Validity">{t.validityDays} days</td>
                  <td data-label="Payment terms">{t.defaultPaymentTerms ?? "—"}</td>
                  <td data-label="Status">
                    <span className={`badge ${t.active ? "badge-active" : "badge-inactive"}`}>{t.active ? "[ACTIVE]" : "[INACTIVE]"}</span>
                  </td>
                  <td data-label="Created" className="font-mono">{formatDate(t.createdAt)}</td>
                  <td data-label="" style={{ display: "flex", gap: 6 }}>
                    <button className="btn-ghost" onClick={() => duplicate(t.id)}>Duplicate</button>
                    <button className="btn-ghost" onClick={() => toggleActive(t)}>{t.active ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New quotation template">
        <form onSubmit={onCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && <div className="badge badge-overdue" style={{ width: "100%" }}>{error}</div>}
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Validity (days)</label>
              <input type="number" min={1} className="input" value={validityDays} onChange={(e) => setValidityDays(Math.max(1, Number(e.target.value) || 30))} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Default payment terms</label>
              <input className="input" value={defaultPaymentTerms} onChange={(e) => setDefaultPaymentTerms(e.target.value)} placeholder="e.g. Due within 15 days" />
            </div>
          </div>
          <p className="label">Lines</p>
          <LineItemsEditor lines={lines} onChange={setLines} />
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Creating…" : "Create template"}</button>
        </form>
      </Drawer>
    </div>
  );
}
