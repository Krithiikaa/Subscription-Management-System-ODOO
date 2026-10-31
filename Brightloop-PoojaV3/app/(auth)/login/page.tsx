"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectUrl || "/portal/subscriptions");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branded Panel (Spec: Hero gradient, Wordmark, 3 Bullets) */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-heading font-extrabold text-xl text-white shadow-sm">
              B
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white">
              BrightLoop
            </span>
          </div>

          <div className="pt-20 space-y-4 max-w-lg">
            <h1 className="text-4xl font-extrabold font-heading leading-tight tracking-tight">
              Run your recurring revenue in one place.
            </h1>
            <p className="text-indigo-100 text-base leading-relaxed">
              From product catalog and customized quote templates to automated billing, idempotent invoices, and instant revenue reporting.
            </p>
          </div>
        </div>

        {/* Feature Bullets */}
        <div className="space-y-4 max-w-md pt-8">
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Automated, idempotent daily billing engine with month-end date clamping</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Server-side tenant isolation & strict role-based access control</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <Zap className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Live MRR normalization & SQL aggregate reporting under 2 seconds</span>
          </div>
        </div>

        <div className="text-xs text-indigo-200">
          © 2026 BrightLoop Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-heading font-bold text-white">
                B
              </div>
              <span className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                BrightLoop
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter your email and password to access the portal.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Work Email
              </label>
              <Input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                required
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-medium"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4"
            >
              Create Customer Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
