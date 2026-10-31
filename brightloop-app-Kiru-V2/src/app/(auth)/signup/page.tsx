"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validation";
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
        <p className="label">Create account</p>
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
            <input id="password" type="password" className="input" autoComplete="new-password" {...register("password")} />
            {errors.password && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.password.message}</p>}
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", marginTop: "4px" }}>
              9+ characters, with an uppercase letter, a lowercase letter and a special character.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" className="input" autoComplete="new-password" {...register("confirmPassword")} />
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
      </div>
    </main>
  );
}
