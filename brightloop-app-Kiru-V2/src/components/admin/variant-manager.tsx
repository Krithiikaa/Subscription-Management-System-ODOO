"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/shared/drawer";
import { createVariantSchema, updateVariantSchema } from "@/lib/validation";
import { formatMoney } from "@/lib/utils";
import type { z } from "zod";

type CreateFormValues = z.input<typeof createVariantSchema>;

type ProductOption = { id: number; name: string };
type VariantRow = {
  id: number;
  productId: number;
  name: string;
  code: string | null;
  extraPrice: string;
  costPrice: string;
  active: boolean;
};

export function VariantManager() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productFilter, setProductFilter] = useState<number | "">("");
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createVariantSchema) });

  useEffect(() => {
    fetch("/api/products?pageSize=100")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []));
  }, []);

  async function loadVariants() {
    if (!productFilter) {
      setVariants([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/products/${productFilter}/variants`);
    const data = await res.json();
    setVariants(data.variants ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilter]);

  async function onCreate(values: CreateFormValues) {
    if (!productFilter) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productFilter}/variants`, {
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
      await loadVariants();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(variant: VariantRow) {
    const parsed = updateVariantSchema.safeParse({ active: !variant.active });
    if (!parsed.success) return;
    await fetch(`/api/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    await loadVariants();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <select
          className="input"
          style={{ width: 260 }}
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button className="btn-primary" disabled={!productFilter} onClick={() => setCreateOpen(true)}>+ New variant</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {!productFilter ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Select a product to view its variants.</p>
        ) : loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : variants.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No variants for this product yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Name</th>
                <th>Code</th>
                <th>Extra price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="ledger-row">
                  <td data-label="Name" style={{ padding: "10px 0" }}>{v.name}</td>
                  <td data-label="Code" className="font-mono">{v.code ?? "—"}</td>
                  <td data-label="Extra price" className="font-mono">+{formatMoney(v.extraPrice)}</td>
                  <td data-label="Status">
                    <span className={`badge ${v.active ? "badge-active" : "badge-inactive"}`}>{v.active ? "[ACTIVE]" : "[INACTIVE]"}</span>
                  </td>
                  <td data-label="">
                    <button className="btn-ghost" onClick={() => toggleActive(v)}>{v.active ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New variant">
        <form onSubmit={handleSubmit(onCreate)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label" htmlFor="v-name">Name</label>
            <input id="v-name" className="input" {...register("name")} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="v-code">Code (optional)</label>
            <input id="v-code" className="input" {...register("code")} />
          </div>
          <div>
            <label className="label" htmlFor="v-description">Description</label>
            <textarea id="v-description" className="input" {...register("description")} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="v-extraPrice">Additional price (₹)</label>
              <input id="v-extraPrice" className="input font-mono" {...register("extraPrice")} />
              {errors.extraPrice && <p className="field-error">{errors.extraPrice.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="v-costPrice">Additional cost (₹)</label>
              <input id="v-costPrice" className="input font-mono" {...register("costPrice")} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create variant"}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
