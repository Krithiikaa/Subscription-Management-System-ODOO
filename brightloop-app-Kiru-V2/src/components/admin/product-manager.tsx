"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/shared/drawer";
import { CategoryManager } from "@/components/admin/category-manager";
import { createProductSchema, PRODUCT_STATUSES, PRODUCT_TYPES } from "@/lib/validation";
import { formatDate, formatMoney } from "@/lib/utils";
import type { z } from "zod";

type FormValues = z.input<typeof createProductSchema>;

type ProductRow = {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  type: string;
  description: string | null;
  salesPrice: string;
  costPrice: string;
  currency: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

type ProductDetail = {
  product: ProductRow;
  variants: Array<{ id: number; name: string; extraPrice: string; active: boolean }>;
  plans: Array<{ id: number; name: string; price: string; billingPeriod: string; active: boolean }>;
  assignedStaff: Array<{ id: number; name: string; email: string }>;
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-active",
  INACTIVE: "badge-inactive",
  ARCHIVED: "badge-archived",
};

type CategoryOption = { id: number; name: string; active: boolean };

export function ProductManager() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createProductSchema) });

  async function loadProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status]);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function openDetail(id: number) {
    setDetailLoading(true);
    setEditing(false);
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    setDetail(data);
    setDetailLoading(false);
  }

  async function onCreate(values: FormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
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
      await loadProducts();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await loadProducts();
    if (detail?.product.id === id) await openDetail(id);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" style={{ width: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select className="input" style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <CategoryManager onChange={loadCategories} />
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ New product</button>
        </div>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : products.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No products found.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => openDetail(p.id)}>
                  <td data-label="Name" style={{ padding: "10px 0" }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.sku && <div className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{p.sku}</div>}
                  </td>
                  <td data-label="Category">{p.category}</td>
                  <td data-label="Price" className="font-mono">{formatMoney(p.salesPrice)}</td>
                  <td data-label="Status">
                    <span className={`badge ${STATUS_BADGE[p.status] ?? "badge-draft"}`}>[{p.status}]</span>
                  </td>
                  <td data-label="Created" className="font-mono">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New product">
        <form onSubmit={handleSubmit(onCreate)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>}
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" {...register("name")} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="sku">SKU (optional)</label>
            <input id="sku" className="input" {...register("sku")} />
          </div>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" {...register("category")}>
              <option value="">Select a category</option>
              {categories.filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="type">Product type</label>
            <select id="type" className="input" {...register("type")}>
              <option value="">Select a type</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.type && <p className="field-error">{errors.type.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" className="input" {...register("description")} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="salesPrice">Sales price (₹)</label>
              <input id="salesPrice" className="input font-mono" {...register("salesPrice")} />
              {errors.salesPrice && <p className="field-error">{errors.salesPrice.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="costPrice">Cost price (₹)</label>
              <input id="costPrice" className="input font-mono" {...register("costPrice")} />
              {errors.costPrice && <p className="field-error">{errors.costPrice.message}</p>}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="notes">Notes</label>
            <textarea id="notes" className="input" {...register("notes")} />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create product"}
          </button>
        </form>
      </Drawer>

      <Drawer open={!!detail || detailLoading} onClose={() => setDetail(null)} title={detail?.product.name ?? "Loading…"}>
        {detailLoading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
        {detail && !editing && (
          <ProductDetailView
            detail={detail}
            onEdit={() => setEditing(true)}
            onStatusChange={(s) => updateStatus(detail.product.id, s)}
          />
        )}
        {detail && editing && (
          <ProductEditForm
            product={detail.product}
            categories={categories}
            onCancel={() => setEditing(false)}
            onSaved={async () => {
              setEditing(false);
              await openDetail(detail.product.id);
              await loadProducts();
            }}
          />
        )}
      </Drawer>
    </div>
  );
}

function ProductDetailView({
  detail,
  onEdit,
  onStatusChange,
}: {
  detail: ProductDetail;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}) {
  const { product, variants, plans, assignedStaff } = detail;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className={`badge ${STATUS_BADGE[product.status] ?? "badge-draft"}`}>[{product.status}]</span>
        <button className="btn-ghost" onClick={onEdit}>Edit</button>
      </div>
      <div>
        <p className="label">Category</p>
        <p>{product.category} · {product.type}</p>
      </div>
      {product.description && (
        <div>
          <p className="label">Description</p>
          <p style={{ fontSize: "var(--text-sm)" }}>{product.description}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <p className="label">Sales price</p>
          <p className="font-mono">{formatMoney(product.salesPrice)}</p>
        </div>
        {"costPrice" in product && (
          <div>
            <p className="label">Cost price</p>
            <p className="font-mono">{formatMoney(product.costPrice)}</p>
          </div>
        )}
      </div>
      <div>
        <p className="label">Variants ({variants.length})</p>
        {variants.length === 0 ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No variants yet.</p>
        ) : (
          variants.map((v) => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", padding: "6px 0", borderBottom: "1px solid var(--hairline)" }}>
              <span>{v.name}</span>
              <span className="font-mono">+{formatMoney(v.extraPrice)}</span>
            </div>
          ))
        )}
      </div>
      <div>
        <p className="label">Plans ({plans.length})</p>
        {plans.length === 0 ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No plans yet.</p>
        ) : (
          plans.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", padding: "6px 0", borderBottom: "1px solid var(--hairline)" }}>
              <span>{p.name} ({p.billingPeriod})</span>
              <span className="font-mono">{formatMoney(p.price)}</span>
            </div>
          ))
        )}
      </div>
      {assignedStaff && (
        <div>
          <p className="label">Assigned staff ({assignedStaff.length})</p>
          {assignedStaff.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No staff assigned yet.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {assignedStaff.map((s) => (
                <span key={s.id} className="chip">{s.name}</span>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {product.status !== "ACTIVE" && (
          <button className="btn-ghost" onClick={() => onStatusChange("ACTIVE")}>Activate</button>
        )}
        {product.status !== "INACTIVE" && (
          <button className="btn-ghost" onClick={() => onStatusChange("INACTIVE")}>Deactivate</button>
        )}
        {product.status !== "ARCHIVED" && (
          <button className="btn-danger" onClick={() => onStatusChange("ARCHIVED")}>Archive</button>
        )}
      </div>
    </div>
  );
}

function ProductEditForm({
  product,
  categories,
  onCancel,
  onSaved,
}: {
  product: ProductRow;
  categories: CategoryOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku ?? "");
  const [category, setCategory] = useState(product.category);
  const [type, setType] = useState(product.type);
  const [description, setDescription] = useState(product.description ?? "");
  const [salesPrice, setSalesPrice] = useState(product.salesPrice);
  const [costPrice, setCostPrice] = useState(product.costPrice ?? "0");
  const [notes, setNotes] = useState(product.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku: sku || undefined, category, type, description: description || undefined, salesPrice, costPrice, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onSaved();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && <div className="badge badge-overdue" style={{ width: "100%" }}>{error}</div>}
      <div>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">SKU</label>
        <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} />
      </div>
      <div>
        <label className="label">Category</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {!categories.some((c) => c.name === category) && (
            <option value={category}>{category} (inactive)</option>
          )}
          {categories.filter((c) => c.active || c.name === category).map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Product type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="label">Sales price (₹)</label>
          <input className="input font-mono" value={salesPrice} onChange={(e) => setSalesPrice(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">Cost price (₹)</label>
          <input className="input font-mono" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
