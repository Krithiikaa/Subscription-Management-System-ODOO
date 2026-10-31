import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/shared/logout-button";

export default async function PortalPage() {
  const session = await getSession();

  return (
    <main style={{ minHeight: "100dvh", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <p className="label">Customer portal</p>
          <h1 style={{ fontSize: "var(--text-2xl)", margin: "4px 0 0" }}>Welcome, {session?.name}</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="panel" style={{ padding: "24px", maxWidth: "480px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Your subscriptions and invoices will appear here in a later phase.
        </p>
      </div>
    </main>
  );
}
