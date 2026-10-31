import { TaxRuleManager } from "@/components/admin/tax-rule-manager";

export default function AdminTaxesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Catalogue</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Tax rules
        </h2>
      </div>
      <TaxRuleManager />
    </div>
  );
}
