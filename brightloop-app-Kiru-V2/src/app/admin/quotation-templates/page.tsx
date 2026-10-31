import { QuotationTemplateManager } from "@/components/admin/quotation-template-manager";

export default function QuotationTemplatesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Commercial</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Quotation templates
        </h2>
      </div>
      <QuotationTemplateManager />
    </div>
  );
}
