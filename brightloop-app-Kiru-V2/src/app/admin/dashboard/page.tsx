import { getSession } from "@/lib/session";
import { FinanceDashboard } from "@/components/admin/finance-dashboard";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const role = session?.role === "ADMIN" ? "ADMIN" : "STAFF";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Welcome back</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          {session?.name}
        </h2>
      </div>
      <FinanceDashboard role={role} />
    </div>
  );
}
