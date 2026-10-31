"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/shared/drawer";
import { BILLING_PERIODS, createPlanSchema } from "@/lib/validation";
import { formatDate, formatMoney } from "@/lib/utils";
import type { z } from "zod";

type FormValues = z.input<typeof createPlanSchema>;

type ProductOption = { id: number; name: string };
type PlanRow = {
  id: number;
  productId: number;
  name: string;
  price: string;
  billingPeriod: string;
  minQuantity: number;
  availableFrom: string | null;
  availableTo: string | null;
  active: boolean;
};

export function PlanManager() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createPlanSchema) });

  useEffect(() => {
    fetch("/api/products?pageSize=100")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []));
  }, []);

  async function loadPlans() {
    setLoading(true);
    const params = new URLSearchParams();
    if (productFilter) params.set("productId", productFilter);
    if (periodFilter) params.set("billingPeriod", periodFilter);
    const res = await fetch(`/api/plans?${params.toString()}`);
    const data = await res.json();
    setPlans(data.plans ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilter, periodFilter]);

  function productName(id: number) {
    return products.find((p) => p.id === id)?.name ?? `#${id}`;
  }

  async function onCreate(values: FormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, productId: Number(values.productId) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      reset();
      setCreateOpen(false);
      await loadPlans();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(plan: PlanRow) {
    await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !plan.active }),
    });
    await loadPlans();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <select className="input" style={{ width: 220 }} value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="input" style={{ width: 160 }} value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="">All frequencies</option>
            {BILLING_PERIODS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ New plan</button>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : plans.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No plans found.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Plan</th>
                <th>Product</th>
                <th>Frequency</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="ledger-row">
                  <td data-label="Plan" style={{ padding: "10px 0" }}>{p.name}</td>
                  <td data-label="Product">{productName(p.productId)}</td>
                  <td data-label="Frequency">{p.billingPeriod}</td>
                  <td data-label="Price" className="font-mono">{formatMoney(p.price)}</td>
                  <td data-label="Availability" className="font-mono" style={{ fontSize: "var(--text-xs)" }}>
                    {p.availableFrom ? formatDate(p.availableFrom) : "—"} → {p.availableTo ? formatDate(p.availableTo) : "—"}
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${p.active ? "badge-active" : "badge-inactive"}`}>{p.active ? "[ACTIVE]" : "[INACTIVE]"}</span>
                  </td>
                  <td data-label="">
                    <button className="btn-ghost" onClick={() => toggleActive(p)}>{p.active ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New plan">
        <form onSubmit={handleSubmit(onCreate)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label" htmlFor="p-product">Product</label>
            <select id="p-product" className="input" {...register("productId", { valueAsNumber: true })}>
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.productId && <p className="field-error">{errors.productId.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="p-name">Plan name</label>
            <input id="p-name" className="input" {...register("name")} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="p-description">Description</label>
            <textarea id="p-description" className="input" {...register("description")} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="p-price">Price (₹)</label>
              <input id="p-price" className="input font-mono" {...register("price")} />
              {errors.price && <p className="field-error">{errors.price.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="p-billingPeriod">Billing frequency</label>
              <select id="p-billingPeriod" className="input" {...register("billingPeriod")}>
                <option value="">Select</option>
                {BILLING_PERIODS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.billingPeriod && <p className="field-error">{errors.billingPeriod.message}</p>}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="p-minQuantity">Minimum quantity</label>
            <input id="p-minQuantity" type="number" min={1} className="input" {...register("minQuantity", { valueAsNumber: true })} />
            {errors.minQuantity && <p className="field-error">{errors.minQuantity.message}</p>}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="p-availableFrom">Available from</label>
              <input id="p-availableFrom" type="date" className="input" {...register("availableFrom")} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="p-availableTo">Available to</label>
              <input id="p-availableTo" type="date" className="input" {...register("availableTo")} />
              {errors.availableTo && <p className="field-error">{errors.availableTo.message}</p>}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
              <input type="checkbox" {...register("autoClose")} /> Auto-close
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
              <input type="checkbox" defaultChecked {...register("closable")} /> Allow close-early
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
              <input type="checkbox" {...register("pausable")} /> Allow pause
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
              <input type="checkbox" defaultChecked {...register("renewable")} /> Allow renewal
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create plan"}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
