import { SubscriptionManager } from "@/components/admin/subscription-manager";

export default function AdminSubscriptionsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Commercial</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Subscriptions
        </h2>
      </div>
      <SubscriptionManager />
    </div>
  );
}
