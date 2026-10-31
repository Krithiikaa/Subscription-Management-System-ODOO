"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { AuthShell } from "@/components/layout/auth-shell";
import { PasswordInput } from "@/components/shared/password-input";
import type { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

// Demo profiles sign in via /api/auth/demo-login, which resolves the actual
// account server-side from env vars — no password ever reaches the client
// or source control. Gated behind DEMO_LOGIN_ENABLED on the server.
const DEMO_PROFILES = [
  { role: "ADMIN", label: "Admin" },
  { role: "STAFF", label: "Staff" },
  { role: "CUSTOMER", label: "Demo Customer" },
];

const PERSON_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  function redirectAfterLogin(redirectTo?: string) {
    const from = searchParams.get("from");
    router.push(from && from.startsWith("/") ? from : redirectTo ?? "/");
    router.refresh();
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong");
        return;
      }
      redirectAfterLogin(data.redirectTo);
    } catch {
      setServerError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signInAsDemo(role: string) {
    setServerError(null);
    setDemoLoading(role);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Demo login unavailable");
        return;
      }
      redirectAfterLogin(data.redirectTo);
    } catch {
      setServerError("Something went wrong. Try again.");
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <AuthShell>
      <h2 className="auth-form-heading">Sign in</h2>
      <p className="auth-form-subtitle">Enter your details to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
        {serverError && (
          <div className="badge badge-overdue" style={{ width: "100%" }}>
            {serverError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" {...register("email")} />
          {errors.email && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
          {errors.password && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.password.message}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
        <Link href="/forgot-password" style={{ color: "var(--text-muted)" }}>Forgot password?</Link>
        <Link href="/signup" style={{ color: "var(--accent)" }}>Create account</Link>
      </div>

      <div className="auth-demo-divider">Demo profiles</div>
      <div className="auth-demo-grid">
        {DEMO_PROFILES.map((profile) => (
          <button
            key={profile.role}
            type="button"
            className="auth-demo-card"
            onClick={() => signInAsDemo(profile.role)}
            disabled={demoLoading !== null}
          >
            <span className="auth-demo-avatar">{PERSON_ICON}</span>
            <span className="auth-demo-name">{profile.label}</span>
            <span className="auth-demo-role">{demoLoading === profile.role ? "Signing in…" : profile.role}</span>
          </button>
        ))}
      </div>
    </AuthShell>
  );
}
