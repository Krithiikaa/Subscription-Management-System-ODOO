import { PricingPreviewPanel } from "@/components/admin/pricing-preview-panel";

export default function PricingPreviewPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Catalogue</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Pricing preview
        </h2>
      </div>
      <PricingPreviewPanel />
    </div>
  );
}
