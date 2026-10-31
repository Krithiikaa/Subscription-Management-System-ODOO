import { DiscountManager } from "@/components/admin/discount-manager";

export default function AdminDiscountsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Catalogue</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Discounts
        </h2>
      </div>
      <DiscountManager />
    </div>
  );
}
