import { BrightloopLogo } from "@/components/brand/brightloop-logo";
import { LogoutButton } from "@/components/shared/logout-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MySubscriptions } from "@/components/portal/my-subscriptions";
import Link from "next/link";

export default function PortalSubscriptionsPage() {
  return (
    <main style={{ minHeight: "100dvh", padding: "24px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <BrightloopLogo variant="compact" size={30} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
      <Link href="/portal" className="btn-ghost" style={{ display: "inline-flex", marginBottom: 16 }}>← Back</Link>
      <p className="label">Customer portal</p>
      <h1 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 24px" }}>
        My subscriptions
      </h1>
      <MySubscriptions />
    </main>
  );
}
