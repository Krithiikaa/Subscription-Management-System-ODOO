import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await getSession();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Welcome back</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          {session?.name}
        </h2>
      </div>

      <div className="panel" style={{ padding: 24, maxWidth: 480 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Phase 1 — authentication only. Revenue, subscriptions, invoices and payment
          metrics appear here once the catalog, billing and reporting phases are built.
        </p>
        {session?.role === "ADMIN" && (
          <Link href="/admin/staff" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Manage staff →
          </Link>
        )}
      </div>
    </div>
  );
}
