"use client";

import { useEffect, useState } from "react";

export type EditableLine = {
  productId: number | "";
  variantId: number | "";
  planId: number | "";
  quantity: number;
  taxRuleId: number | "";
  discountId: number | "";
  description: string;
};

export const EMPTY_LINE: EditableLine = { productId: "", variantId: "", planId: "", quantity: 1, taxRuleId: "", discountId: "", description: "" };

type ProductOption = { id: number; name: string };
type VariantOption = { id: number; name: string; active: boolean };
type PlanOption = { id: number; name: string; billingPeriod: string; active: boolean };
type TaxOption = { id: number; name: string; rate: string; active: boolean };
type DiscountOption = { id: number; name: string; active: boolean };

export function LineItemsEditor({ lines, onChange }: { lines: EditableLine[]; onChange: (lines: EditableLine[]) => void }) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [taxRules, setTaxRules] = useState<TaxOption[]>([]);
  const [discounts, setDiscounts] = useState<DiscountOption[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<number, VariantOption[]>>({});
  const [plansByProduct, setPlansByProduct] = useState<Record<number, PlanOption[]>>({});

  useEffect(() => {
    fetch("/api/products?pageSize=100").then((r) => r.json()).then((d) => setProducts(d.products ?? []));
    fetch("/api/tax-rules").then((r) => (r.ok ? r.json() : null)).then((d) => d && setTaxRules(d.taxRules ?? []));
    fetch("/api/discounts").then((r) => (r.ok ? r.json() : null)).then((d) => d && setDiscounts(d.discounts ?? []));
  }, []);

  async function ensureProductData(productId: number) {
    if (!variantsByProduct[productId]) {
      const res = await fetch(`/api/products/${productId}/variants`);
      const data = await res.json();
      setVariantsByProduct((prev) => ({ ...prev, [productId]: data.variants ?? [] }));
    }
    if (!plansByProduct[productId]) {
      const res = await fetch(`/api/plans?productId=${productId}`);
      const data = await res.json();
      setPlansByProduct((prev) => ({ ...prev, [productId]: data.plans ?? [] }));
    }
  }

  function updateLine(index: number, patch: Partial<EditableLine>) {
    const next = lines.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onChange(next);
  }

  function addLine() {
    onChange([...lines, { ...EMPTY_LINE }]);
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {lines.map((line, i) => (
        <div key={i} className="panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="label" style={{ marginBottom: 0 }}>Line {i + 1}</span>
            {lines.length > 1 && (
              <button type="button" className="icon-btn" onClick={() => removeLine(i)} aria-label="Remove line">✕</button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <select
              className="input"
              required
              value={line.productId}
              onChange={(e) => {
                const productId = e.target.value ? Number(e.target.value) : "";
                updateLine(i, { productId, variantId: "", planId: "" });
                if (productId) ensureProductData(productId);
              }}
            >
              <option value="">Product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              className="input"
              value={line.variantId}
              disabled={!line.productId}
              onChange={(e) => updateLine(i, { variantId: e.target.value ? Number(e.target.value) : "" })}
            >
              <option value="">No variant</option>
              {line.productId &&
                (variantsByProduct[line.productId] ?? []).filter((v) => v.active).map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
            </select>
            <select
              className="input"
              required
              value={line.planId}
              disabled={!line.productId}
              onChange={(e) => updateLine(i, { planId: e.target.value ? Number(e.target.value) : "" })}
            >
              <option value="">Plan…</option>
              {line.productId &&
                (plansByProduct[line.productId] ?? []).filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.billingPeriod})</option>
                ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 10 }}>
            <input
              type="number"
              min={1}
              className="input"
              value={line.quantity}
              onChange={(e) => updateLine(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
            />
            <select className="input" value={line.taxRuleId} onChange={(e) => updateLine(i, { taxRuleId: e.target.value ? Number(e.target.value) : "" })}>
              <option value="">No tax</option>
              {taxRules.filter((t) => t.active).map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
              ))}
            </select>
            <select className="input" value={line.discountId} onChange={(e) => updateLine(i, { discountId: e.target.value ? Number(e.target.value) : "" })}>
              <option value="">No discount</option>
              {discounts.filter((d) => d.active).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <input
            className="input"
            placeholder="Line note (optional)"
            value={line.description}
            onChange={(e) => updateLine(i, { description: e.target.value })}
          />
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={addLine}>+ Add line</button>
    </div>
  );
}

// Returns a clear error message if any line is incomplete, or if none are
// filled in at all — instead of letting an incomplete line silently drop out
// of the payload and surface only a generic "at least one line" server error.
export function validateLines(lines: EditableLine[]): string | null {
  const incomplete = lines.some((l) => (l.productId && !l.planId) || (!l.productId && l.planId));
  if (incomplete) return "Each line needs both a product and a plan selected.";
  const complete = lines.filter((l) => l.productId && l.planId);
  if (complete.length === 0) return "Add at least one line with a product and a plan selected.";
  return null;
}

export function linesToPayload(lines: EditableLine[]) {
  return lines
    .filter((l) => l.productId && l.planId)
    .map((l) => ({
      productId: Number(l.productId),
      variantId: l.variantId ? Number(l.variantId) : undefined,
      planId: Number(l.planId),
      quantity: l.quantity,
      taxRuleId: l.taxRuleId ? Number(l.taxRuleId) : undefined,
      discountId: l.discountId ? Number(l.discountId) : undefined,
      description: l.description || undefined,
    }));
}
