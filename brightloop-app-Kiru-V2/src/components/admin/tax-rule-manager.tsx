"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/shared/drawer";
import { createTaxRuleSchema } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import type { z } from "zod";

type FormValues = z.input<typeof createTaxRuleSchema>;

type TaxRuleRow = {
  id: number;
  name: string;
  code: string | null;
  rate: string;
  type: string;
  productId: number | null;
  category: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  active: boolean;
};

type CategoryOption = { id: number; name: string; active: boolean };

export function TaxRuleManager() {
  const [taxRules, setTaxRules] = useState<TaxRuleRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createTaxRuleSchema) });

  async function loadTaxRules() {
    setLoading(true);
    const res = await fetch("/api/tax-rules");
    const data = await res.json();
    setTaxRules(data.taxRules ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTaxRules();
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  async function onCreate(values: FormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/tax-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      reset();
      setCreateOpen(false);
      await loadTaxRules();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(rule: TaxRuleRow) {
    await fetch(`/api/tax-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rule.active }),
    });
    await loadTaxRules();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ New tax rule</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : taxRules.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No tax rules yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Name</th>
                <th>Rate</th>
                <th>Applicability</th>
                <th>Effective</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {taxRules.map((t) => (
                <tr key={t.id} className="ledger-row">
                  <td data-label="Name" style={{ padding: "10px 0" }}>
                    {t.name} {t.code && <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>({t.code})</span>}
                  </td>
                  <td data-label="Rate" className="font-mono">{t.rate}%</td>
                  <td data-label="Applicability">{t.category ?? (t.productId ? `Product #${t.productId}` : "All products")}</td>
                  <td data-label="Effective" className="font-mono" style={{ fontSize: "var(--text-xs)" }}>
                    {t.effectiveFrom ? formatDate(t.effectiveFrom) : "—"} → {t.effectiveTo ? formatDate(t.effectiveTo) : "—"}
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${t.active ? "badge-active" : "badge-inactive"}`}>{t.active ? "[ACTIVE]" : "[INACTIVE]"}</span>
                  </td>
                  <td data-label="">
                    <button className="btn-ghost" onClick={() => toggleActive(t)}>{t.active ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New tax rule">
        <form onSubmit={handleSubmit(onCreate)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label" htmlFor="t-name">Name</label>
            <input id="t-name" className="input" {...register("name")} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="t-code">Code (optional)</label>
            <input id="t-code" className="input" {...register("code")} />
          </div>
          <div>
            <label className="label" htmlFor="t-rate">Rate (%)</label>
            <input id="t-rate" className="input font-mono" {...register("rate")} />
            {errors.rate && <p className="field-error">{errors.rate.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="t-description">Description</label>
            <textarea id="t-description" className="input" {...register("description")} />
          </div>
          <div>
            <label className="label" htmlFor="t-category">Applicable category (optional — blank applies to all)</label>
            <select id="t-category" className="input" {...register("category")}>
              <option value="">All products</option>
              {categories.filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="t-effectiveFrom">Effective from</label>
              <input id="t-effectiveFrom" type="date" className="input" {...register("effectiveFrom")} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="t-effectiveTo">Effective to</label>
              <input id="t-effectiveTo" type="date" className="input" {...register("effectiveTo")} />
              {errors.effectiveTo && <p className="field-error">{errors.effectiveTo.message}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create tax rule"}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
