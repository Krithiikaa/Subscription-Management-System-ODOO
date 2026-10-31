"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validation";
import { AuthShell } from "@/components/layout/auth-shell";
import { PasswordInput } from "@/components/shared/password-input";
import type { z } from "zod";

type FormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setServerError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h2 className="auth-form-heading">Reset password</h2>
      <p className="auth-form-subtitle">Choose a new password for your account.</p>

      <div style={{ marginTop: "24px" }}>
        {!token ? (
          <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
            Missing or invalid reset link. Request a new one from the{" "}
            <Link href="/forgot-password" style={{ color: "var(--accent)" }}>forgot password</Link> page.
          </p>
        ) : success ? (
          <p style={{ fontSize: "var(--text-sm)" }}>Password updated. Redirecting to sign in…</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="hidden" {...register("token")} />
            {serverError && (
              <div className="badge badge-overdue" style={{ width: "100%" }}>
                {serverError}
              </div>
            )}

            <div>
              <label className="label" htmlFor="password">New password</label>
              <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.password.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm new password</label>
              <PasswordInput id="confirmPassword" autoComplete="new-password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>

      <div style={{ marginTop: "20px", fontSize: "var(--text-xs)" }}>
        <Link href="/login" style={{ color: "var(--text-muted)" }}>Back to sign in</Link>
      </div>
    </AuthShell>
  );
}
