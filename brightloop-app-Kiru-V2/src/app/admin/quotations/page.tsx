import { getSession } from "@/lib/session";
import { QuotationManager } from "@/components/admin/quotation-manager";

export default async function AdminQuotationsPage() {
  const session = await getSession();
  const role = session?.role === "ADMIN" ? "ADMIN" : "STAFF";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Commercial</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Quotations
        </h2>
      </div>
      <QuotationManager role={role} />
    </div>
  );
}
