import { PaymentManager } from "@/components/admin/payment-manager";

export default function AdminPaymentsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Billing</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Payments
        </h2>
      </div>
      <PaymentManager />
    </div>
  );
}
