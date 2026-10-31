"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation";
import { AuthShell } from "@/components/layout/auth-shell";
import type { z } from "zod";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      setMessage(data.message ?? "If that email is registered, a reset link has been sent.");
    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h2 className="auth-form-heading">Forgot password</h2>
      <p className="auth-form-subtitle">We&apos;ll email you a link to reset it.</p>

      <div style={{ marginTop: "24px" }}>
        {message ? (
          <p style={{ fontSize: "var(--text-sm)" }}>{message}</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" autoComplete="email" {...register("email")} />
              {errors.email && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.email.message}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
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
