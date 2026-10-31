import Link from "next/link";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/shared/logout-button";

export default async function AdminDashboardPage() {
  const session = await getSession();

  return (
    <main style={{ minHeight: "100dvh", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <p className="label">{session?.role}</p>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", margin: "4px 0 0" }}>
            Welcome, {session?.name}
          </h1>
        </div>
        <LogoutButton />
      </div>

      <div className="panel" style={{ padding: "24px", maxWidth: "480px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Phase 1 — authentication only. Catalog, subscriptions, billing and reporting land in later phases.
        </p>
        {session?.role === "ADMIN" && (
          <Link href="/admin/staff" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
            Manage staff →
          </Link>
        )}
      </div>
    </main>
  );
}
