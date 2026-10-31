"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/shared/drawer";
import { createDiscountSchema, DISCOUNT_SCOPES, DISCOUNT_TYPES } from "@/lib/validation";
import { formatDate, formatMoney } from "@/lib/utils";
import type { z } from "zod";

type FormValues = z.input<typeof createDiscountSchema>;

type ProductOption = { id: number; name: string };
type DiscountRow = {
  id: number;
  name: string;
  code: string | null;
  type: "FIXED" | "PERCENTAGE";
  value: string;
  scope: string;
  productId: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export function DiscountManager() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createDiscountSchema) });

  const scope = watch("scope");

  useEffect(() => {
    fetch("/api/products?pageSize=100")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []));
  }, []);

  async function loadDiscounts() {
    setLoading(true);
    const res = await fetch("/api/discounts");
    const data = await res.json();
    setDiscounts(data.discounts ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDiscounts();
  }, []);

  function productName(id: number | null) {
    if (!id) return "—";
    return products.find((p) => p.id === id)?.name ?? `#${id}`;
  }

  async function onCreate(values: FormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = { ...values, productId: values.productId ? Number(values.productId) : undefined };
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      reset();
      setCreateOpen(false);
      await loadDiscounts();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(discount: DiscountRow) {
    await fetch(`/api/discounts/${discount.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !discount.active }),
    });
    await loadDiscounts();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ New discount</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : discounts.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No discounts yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Name</th>
                <th>Value</th>
                <th>Applies to</th>
                <th>Validity</th>
                <th>Usage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="ledger-row">
                  <td data-label="Name" style={{ padding: "10px 0" }}>
                    {d.name} {d.code && <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>({d.code})</span>}
                  </td>
                  <td data-label="Value" className="font-mono">{d.type === "PERCENTAGE" ? `${d.value}%` : formatMoney(d.value)}</td>
                  <td data-label="Applies to">{d.scope === "PRODUCT" ? productName(d.productId) : "Any subscription"}</td>
                  <td data-label="Validity" className="font-mono" style={{ fontSize: "var(--text-xs)" }}>
                    {d.startDate ? formatDate(d.startDate) : "—"} → {d.endDate ? formatDate(d.endDate) : "—"}
                  </td>
                  <td data-label="Usage" className="font-mono">{d.usedCount}{d.usageLimit ? ` / ${d.usageLimit}` : ""}</td>
                  <td data-label="Status">
                    <span className={`badge ${d.active ? "badge-active" : "badge-inactive"}`}>{d.active ? "[ACTIVE]" : "[INACTIVE]"}</span>
                  </td>
                  <td data-label="">
                    <button className="btn-ghost" onClick={() => toggleActive(d)}>{d.active ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New discount">
        <form onSubmit={handleSubmit(onCreate)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label" htmlFor="d-name">Name</label>
            <input id="d-name" className="input" {...register("name")} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="d-code">Code (optional)</label>
            <input id="d-code" className="input" {...register("code")} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="d-type">Type</label>
              <select id="d-type" className="input" {...register("type")}>
                <option value="">Select</option>
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && <p className="field-error">{errors.type.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="d-value">Value</label>
              <input id="d-value" className="input font-mono" {...register("value")} />
              {errors.value && <p className="field-error">{errors.value.message}</p>}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="d-scope">Scope</label>
            <select id="d-scope" className="input" {...register("scope")}>
              <option value="">Select</option>
              {DISCOUNT_SCOPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.scope && <p className="field-error">{errors.scope.message}</p>}
          </div>
          {scope === "PRODUCT" && (
            <div>
              <label className="label" htmlFor="d-productId">Product</label>
              <select id="d-productId" className="input" {...register("productId", { valueAsNumber: true })}>
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.productId && <p className="field-error">{errors.productId.message}</p>}
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="d-minPurchase">Min. purchase (₹, optional)</label>
              <input id="d-minPurchase" className="input font-mono" {...register("minPurchase")} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="d-minQuantity">Min. quantity (optional)</label>
              <input id="d-minQuantity" type="number" min={1} className="input" {...register("minQuantity", { valueAsNumber: true })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="d-startDate">Valid from</label>
              <input id="d-startDate" type="date" className="input" {...register("startDate")} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="d-endDate">Valid until</label>
              <input id="d-endDate" type="date" className="input" {...register("endDate")} />
              {errors.endDate && <p className="field-error">{errors.endDate.message}</p>}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="d-usageLimit">Usage limit (optional)</label>
            <input id="d-usageLimit" type="number" min={1} className="input" {...register("usageLimit", { valueAsNumber: true })} />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create discount"}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
