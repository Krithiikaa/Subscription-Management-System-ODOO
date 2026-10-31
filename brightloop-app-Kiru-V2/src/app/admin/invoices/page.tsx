import { InvoiceManager } from "@/components/admin/invoice-manager";
import { getSession } from "@/lib/session";

export default async function AdminInvoicesPage() {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Billing</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Invoices
        </h2>
      </div>
      <InvoiceManager canRunBilling={isAdmin} />
    </div>
  );
}
