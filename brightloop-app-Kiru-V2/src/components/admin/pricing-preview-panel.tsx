"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/utils";

type ProductOption = { id: number; name: string };
type VariantOption = { id: number; name: string; extraPrice: string; active: boolean };
type PlanOption = { id: number; name: string; billingPeriod: string; minQuantity: number; active: boolean };
type TaxOption = { id: number; name: string; rate: string; active: boolean };
type DiscountOption = { id: number; name: string; active: boolean };

type PreviewResult = {
  preview: {
    basePrice: string;
    variantExtra: string;
    unitPrice: string;
    quantity: number;
    subtotal: string;
    discountApplied: boolean;
    discountRejectReason: string | null;
    discountAmount: string;
    taxableAmount: string;
    taxRatePct: string;
    taxAmount: string;
    total: string;
  };
  product: { id: number; name: string; currency: string };
};

export function PricingPreviewPanel() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [variantId, setVariantId] = useState("");
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [planId, setPlanId] = useState("");
  const [taxRules, setTaxRules] = useState<TaxOption[]>([]);
  const [taxRuleId, setTaxRuleId] = useState("");
  const [discounts, setDiscounts] = useState<DiscountOption[]>([]);
  const [discountId, setDiscountId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canSeeTaxDiscount, setCanSeeTaxDiscount] = useState(false);

  useEffect(() => {
    fetch("/api/products?pageSize=100").then((r) => r.json()).then((data) => setProducts(data.products ?? []));
    fetch("/api/tax-rules")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTaxRules(data.taxRules ?? []);
          setCanSeeTaxDiscount(true);
        }
      });
    fetch("/api/discounts")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setDiscounts(data.discounts ?? []);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVariantId("");
    setPlanId("");
    if (!productId) {
      setVariants([]);
      setPlans([]);
      return;
    }
    fetch(`/api/products/${productId}/variants`).then((r) => r.json()).then((data) => setVariants(data.variants ?? []));
    fetch(`/api/plans?productId=${productId}`).then((r) => r.json()).then((data) => setPlans(data.plans ?? []));
  }, [productId]);

  async function runPreview() {
    if (!productId) return;
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/pricing-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productId),
          variantId: variantId ? Number(variantId) : undefined,
          planId: planId ? Number(planId) : undefined,
          quantity,
          taxRuleId: taxRuleId ? Number(taxRuleId) : undefined,
          discountId: discountId ? Number(discountId) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="label">Product</label>
          <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Variant (optional)</label>
          <select className="input" value={variantId} onChange={(e) => setVariantId(e.target.value)} disabled={!productId}>
            <option value="">No variant</option>
            {variants.filter((v) => v.active).map((v) => (
              <option key={v.id} value={v.id}>{v.name} (+{formatMoney(v.extraPrice)})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Plan (optional)</label>
          <select className="input" value={planId} onChange={(e) => setPlanId(e.target.value)} disabled={!productId}>
            <option value="">No plan</option>
            {plans.filter((p) => p.active).map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.billingPeriod})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Quantity</label>
          <input type="number" min={1} className="input" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        {canSeeTaxDiscount && (
          <>
            <div>
              <label className="label">Tax rule (optional)</label>
              <select className="input" value={taxRuleId} onChange={(e) => setTaxRuleId(e.target.value)}>
                <option value="">No tax</option>
                {taxRules.filter((t) => t.active).map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Discount (optional)</label>
              <select className="input" value={discountId} onChange={(e) => setDiscountId(e.target.value)}>
                <option value="">No discount</option>
                {discounts.filter((d) => d.active).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <button className="btn-primary" disabled={!productId || loading} onClick={runPreview}>
          {loading ? "Calculating…" : "Calculate preview"}
        </button>
        {error && <div className="badge badge-overdue" style={{ width: "100%" }}>{error}</div>}
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <p className="label" style={{ marginBottom: 4 }}>Pricing preview</p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 16 }}>
          This is an estimate only — not an invoice or payment request.
        </p>
        {!result ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Select a product and calculate to see a breakdown.</p>
        ) : (
          <div className="font-mono" style={{ fontSize: "var(--text-sm)", display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Base price" value={formatMoney(result.preview.basePrice)} />
            <Row label="Variant addition" value={`+${formatMoney(result.preview.variantExtra)}`} />
            <Row label="Unit price" value={formatMoney(result.preview.unitPrice)} />
            <Row label="Quantity" value={String(result.preview.quantity)} />
            <Row label="Subtotal" value={formatMoney(result.preview.subtotal)} bold />
            <Row
              label={result.preview.discountApplied ? "Discount" : "Discount (not applied)"}
              value={`-${formatMoney(result.preview.discountAmount)}`}
            />
            {result.preview.discountRejectReason && (
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)" }}>
                {result.preview.discountRejectReason}
              </p>
            )}
            <Row label="Taxable amount" value={formatMoney(result.preview.taxableAmount)} />
            <Row label={`Tax (${result.preview.taxRatePct}%)`} value={`+${formatMoney(result.preview.taxAmount)}`} />
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 8, marginTop: 4 }}>
              <Row label="Estimated total" value={formatMoney(result.preview.total)} bold accent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 700 : 400, color: accent ? "var(--accent)" : undefined }}>
      <span style={{ fontFamily: "var(--font-sans)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
