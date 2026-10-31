import { BrightloopLogo } from "@/components/brand/brightloop-logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <BrightloopLogo variant="full" size={40} wordmarkColor="#FFFFFF" descriptorColor="rgba(255,255,255,0.5)" />

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
