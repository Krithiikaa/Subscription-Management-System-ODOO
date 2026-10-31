"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validation";
import { AuthShell } from "@/components/layout/auth-shell";
import { PasswordInput } from "@/components/shared/password-input";
import type { z } from "zod";

type FormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/portal");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h2 className="auth-form-heading">Create account</h2>
      <p className="auth-form-subtitle">Set up your Brightloop customer account.</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
        {serverError && (
          <div className="badge badge-overdue" style={{ width: "100%" }}>
            {serverError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" type="text" className="input" autoComplete="name" {...register("name")} />
          {errors.name && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.name.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" {...register("email")} />
          {errors.email && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.password.message}</p>}
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", marginTop: "4px" }}>
            9+ characters, with an uppercase letter, a lowercase letter and a special character.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <PasswordInput id="confirmPassword" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: "20px", fontSize: "var(--text-xs)" }}>
        <span style={{ color: "var(--text-muted)" }}>Already have an account? </span>
        <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
      </div>
    </AuthShell>
  );
}
