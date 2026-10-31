"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import type { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

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
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/") ? from : data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div className="panel" style={{ padding: "32px", maxWidth: "380px", width: "100%" }}>
        <p className="label">Sign in</p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 20px" }}>
          Brightloop
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
            <input id="password" type="password" className="input" autoComplete="current-password" {...register("password")} />
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
      </div>
    </main>
  );
}
