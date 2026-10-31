"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/utils";
import { Search, CheckCircle2, ChevronRight, X, Loader2 } from "lucide-react";
import type { PortalCatalogueProduct } from "./types";

type Props = {
  onRequestQuoteSuccess: () => void;
};

export function PortalCatalogue({ onRequestQuoteSuccess }: Props) {
  const [products, setProducts] = useState<PortalCatalogueProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Quotation Request Modal state
  const [quoteProduct, setQuoteProduct] = useState<PortalCatalogueProduct | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalogue() {
      try {
        const res = await fetch("/api/portal/catalogue");
        if (res.ok) {
          const json = await res.json();
          setProducts(json.catalogue || []);
        }
      } catch (err) {
        console.error("Failed to load catalogue:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogue();
  }, []);

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  function openQuoteModal(prod: PortalCatalogueProduct) {
    setQuoteProduct(prod);
    setSelectedPlanId(prod.plans[0]?.id || null);
    setSelectedVariantId(prod.variants[0]?.id || null);
    setQuantity(1);
    setNotes("");
    setQuoteSuccess(false);
    setQuoteError(null);
  }

  async function handleRequestQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteProduct || !selectedPlanId) return;

    setSubmitting(true);
    setQuoteError(null);

    try {
      const res = await fetch("/api/portal/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: quoteProduct.id,
          planId: selectedPlanId,
          variantId: selectedVariantId,
          quantity,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create quotation");
      }

      setQuoteSuccess(true);
      setTimeout(() => {
        setQuoteProduct(null);
        onRequestQuoteSuccess();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting quotation request";
      setQuoteError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: "var(--text-sm)" }}>Loading product catalogue...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div
        className="panel"
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--panel)), var(--panel))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="label" style={{ marginBottom: 4 }}>Software Catalogue & Discovery</span>
          <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "0 0 6px" }}>
            Explore Brightloop Business Solutions
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0, maxWidth: 640 }}>
            Discover enterprise cloud tools, email marketing, security suites, and AI engines.
            Prices are pulled directly from our database. Customize plans, pick variants, and receive instant quotations.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ position: "relative", width: 320 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search software (e.g. BrightMail, Storage)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, minHeight: 38, fontSize: "var(--text-xs)" }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                border: selectedCategory === cat ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                background: selectedCategory === cat ? "color-mix(in srgb, var(--accent) 12%, var(--panel))" : "var(--panel)",
                color: selectedCategory === cat ? "var(--text)" : "var(--text-muted)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filtered.map((prod) => {
          const defaultPlan = prod.plans[0];
          const price = defaultPlan ? defaultPlan.price : prod.salesPrice;

          return (
            <div
              key={prod.id}
              className="panel"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
                transition: "border-color var(--transition-fast)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <span className="label" style={{ marginBottom: 2 }}>{prod.category}</span>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
                      {prod.name}
                    </h3>
                  </div>
                  <span className="chip" style={{ fontSize: "0.6875rem" }}>
                    {prod.type}
                  </span>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: "0 0 16px", minHeight: 36 }}>
                  {prod.description || "Enterprise cloud business productivity solution."}
                </p>

                {/* Available Variants Tag */}
                {prod.variants.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span className="label" style={{ fontSize: "0.65rem", marginBottom: 4 }}>
                      Available Variants
                    </span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {prod.variants.map((v) => (
                        <span key={v.id} className="chip" style={{ fontSize: "0.65rem" }}>
                          {v.name} (+{formatMoney(v.extraPrice)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Box */}
                <div
                  style={{
                    background: "var(--table-header)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span className="label" style={{ marginBottom: 2 }}>Starting rate</span>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--accent)" }}>
                      {formatMoney(price)}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {" "} / {defaultPlan ? defaultPlan.billingPeriod.toLowerCase() : "mo"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {prod.plans.length} plan{prod.plans.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => openQuoteModal(prod)}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "space-between", padding: "0 16px" }}
              >
                <span>Request Quotation</span>
                <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quotation Request Modal */}
      {quoteProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 100,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 520,
              padding: "24px",
              position: "relative",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <button
              onClick={() => setQuoteProduct(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            {quoteSuccess ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: "0 auto 16px" }} />
                <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8 }}>
                  Quotation Created!
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                  Your formal quotation has been generated and is ready in your Quotations workspace.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestQuote}>
                <div style={{ marginBottom: 16 }}>
                  <span className="badge badge-warning" style={{ marginBottom: 8 }}>
                    Instant Quotation
                  </span>
                  <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "4px 0" }}>
                    Configure {quoteProduct.name}
                  </h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>
                    Select your billing plan and options to generate a quotation contract.
                  </p>
                </div>

                {quoteError && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius)",
                      background: "color-mix(in srgb, var(--danger) 12%, transparent)",
                      color: "var(--danger)",
                      fontSize: "var(--text-xs)",
                      marginBottom: 16,
                    }}
                  >
                    {quoteError}
                  </div>
                )}

                {/* Plan Selection */}
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Select Billing Plan</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {quoteProduct.plans.map((p) => (
                      <label
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 12px",
                          borderRadius: "var(--radius)",
                          border: selectedPlanId === p.id ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                          background: selectedPlanId === p.id ? "color-mix(in srgb, var(--accent) 8%, var(--panel))" : "var(--panel)",
                          cursor: "pointer",
                          fontSize: "var(--text-xs)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="radio"
                            name="plan"
                            checked={selectedPlanId === p.id}
                            onChange={() => setSelectedPlanId(p.id)}
                          />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>({p.billingPeriod})</span>
                        </div>
                        <span className="font-mono" style={{ fontWeight: 700 }}>
                          {formatMoney(p.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Variant Selection if available */}
                {quoteProduct.variants.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label className="label">Select Storage / Tier Variant</label>
                    <select
                      className="input"
                      value={selectedVariantId || ""}
                      onChange={(e) => setSelectedVariantId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">No extra variant</option>
                      {quoteProduct.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (+{formatMoney(v.extraPrice)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity */}
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Number of Licenses / Units</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
                    className="input font-mono"
                    required
                  />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 18 }}>
                  <label className="label">Requirements / Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input"
                    placeholder="Specific deployment requirements, PO number or team size..."
                    rows={2}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" onClick={() => setQuoteProduct(null)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Generating...
                      </>
                    ) : (
                      "Generate Formal Quotation"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
