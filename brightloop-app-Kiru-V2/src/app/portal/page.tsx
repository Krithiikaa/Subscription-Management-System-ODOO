import Link from "next/link";
import { getSession } from "@/lib/session";
import { BrightloopLogo } from "@/components/brand/brightloop-logo";
import { LogoutButton } from "@/components/shared/logout-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default async function PortalPage() {
  const session = await getSession();

  return (
    <main style={{ minHeight: "100dvh", padding: "24px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <BrightloopLogo variant="compact" size={30} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      <p className="label">Customer portal</p>
      <h1 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 24px" }}>
        Welcome, {session?.name}
      </h1>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/portal/quotations" className="panel" style={{ padding: "24px", width: 220, textDecoration: "none", color: "inherit" }}>
          <p className="label">Quotations</p>
          <p className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginTop: 4 }}>My quotations</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 8 }}>Review and respond to quotations sent to you.</p>
        </Link>
        <Link href="/portal/subscriptions" className="panel" style={{ padding: "24px", width: 220, textDecoration: "none", color: "inherit" }}>
          <p className="label">Subscriptions</p>
          <p className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginTop: 4 }}>My subscriptions</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 8 }}>View your active and past subscriptions.</p>
        </Link>
        <Link href="/portal/invoices" className="panel" style={{ padding: "24px", width: 220, textDecoration: "none", color: "inherit" }}>
          <p className="label">Invoices</p>
          <p className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginTop: 4 }}>My invoices</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 8 }}>View invoices, outstanding balances and due dates.</p>
        </Link>
        <Link href="/portal/payments" className="panel" style={{ padding: "24px", width: 220, textDecoration: "none", color: "inherit" }}>
          <p className="label">Payments</p>
          <p className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginTop: 4 }}>My payments</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 8 }}>Pay outstanding invoices and view payment history.</p>
        </Link>
        <Link href="/portal/software-access" className="panel" style={{ padding: "24px", width: 220, textDecoration: "none", color: "inherit" }}>
          <p className="label">Software Access</p>
          <p className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginTop: 4 }}>My software access</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 8 }}>Launch software you&apos;re entitled to use.</p>
        </Link>
      </div>
    </main>
  );
}
