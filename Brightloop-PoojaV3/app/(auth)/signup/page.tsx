"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength, validatePasswordRules } from "@/components/shared/password-strength";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const rules = validatePasswordRules(password);
    if (!rules.length || !rules.hasUpper || !rules.hasLower || !rules.hasSpecial) {
      setError("Please satisfy all password complexity rules before signing up.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, companyName, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/portal/subscriptions");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branded Panel */}
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
              Start managing your subscriptions in minutes.
            </h1>
            <p className="text-indigo-100 text-base leading-relaxed">
              Create a free customer account to review active plans, view invoices, make secure payments, and manage contracts.
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-md pt-8">
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Self-service customer portal with instant renewal and pause controls</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <span>100% server-isolated account with zero cross-tenant leakage</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <Zap className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Instant PDF and A4 printable statements for finance & tax records</span>
          </div>
        </div>

        <div className="text-xs text-indigo-200">
          © 2026 BrightLoop Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto py-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign up as a customer to access subscription services.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name *
              </label>
              <Input
                type="text"
                required
                placeholder="Pooja Murugan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address *
              </label>
              <Input
                type="email"
                required
                placeholder="pooja@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company Name
                </label>
                <Input
                  type="text"
                  placeholder="Brightloop Labs"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password *
              </label>
              <Input
                type="password"
                required
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrength password={password} />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-medium mt-2"
              isLoading={loading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

