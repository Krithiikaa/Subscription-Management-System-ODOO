import Image from "next/image";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/brightloop-logo.png" alt="" width={36} height={36} style={{ borderRadius: 8 }} />
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.125rem", color: "#FFFFFF" }}>
            Brightloop
          </span>
        </div>

        <div>
          <h1 className="auth-brand-headline">
            Welcome back to
            <br />
            <em>Brightloop.</em>
          </h1>
          <p className="auth-brand-sub">
            Your subscriptions, perfectly billed. Sign in to access your workspace.
          </p>
        </div>

        <p className="auth-brand-footer">© 2026 Brightloop Software. All rights reserved.</p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">{children}</div>
      </div>
    </div>
  );
}
