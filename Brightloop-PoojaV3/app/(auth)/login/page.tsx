"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Shield,
  Briefcase,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

type RoleType = "ADMIN" | "STAFF" | "CUSTOMER";

interface RolePreset {
  role: RoleType;
  title: string;
  badge: string;
  description: string;
  email: string;
  password: string;
  targetDashboard: string;
}

const ROLE_PRESETS: Record<RoleType, RolePreset> = {
  ADMIN: {
    role: "ADMIN",
    title: "Admin Console",
    badge: "Executive & Finance",
    description: "Complete control over catalog, pricing, taxes, discounts, staff & revenue analytics.",
    email: "admin@brightloop.io",
    password: "BrightLoop@2026",
    targetDashboard: "/admin/dashboard",
  },
  STAFF: {
    role: "STAFF",
    title: "Staff Workspace",
    badge: "Operations & Sales",
    description: "Manage day-to-day customer accounts, create quotes, track invoices & log payments.",
    email: "staff.arun@brightloop.io",
    password: "BrightLoop@2026",
    targetDashboard: "/staff/dashboard",
  },
  CUSTOMER: {
    role: "CUSTOMER",
    title: "Customer Portal",
    badge: "Self-Service",
    description: "View active subscriptions, pause/resume services, and download printable tax invoices.",
    email: "contact@apexretail.in",
    password: "BrightLoop@2026",
    targetDashboard: "/portal/subscriptions",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = React.useState<RoleType>("ADMIN");
  const [email, setEmail] = React.useState(ROLE_PRESETS.ADMIN.email);
  const [password, setPassword] = React.useState(ROLE_PRESETS.ADMIN.password);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleRoleSelect = (role: RoleType) => {
    setActiveRole(role);
    setEmail(ROLE_PRESETS[role].email);
    setPassword(ROLE_PRESETS[role].password);
    setError("");
  };

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
        throw new Error(data.error || "Authentication failed");
      }

      router.push(data.redirectUrl || ROLE_PRESETS[activeRole].targetDashboard);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const currentPreset = ROLE_PRESETS[activeRole];

  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center bg-[#8E9AA8] dark:bg-[#0B0E14] font-sans transition-colors">
      {/* Crextio Warm Rounded Container */}
      <div className="w-full max-w-4xl rounded-[2.5rem] crextio-surface border border-white/60 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row gap-8">
        {/* Left Side: Welcome & Brand Overview */}
        <div className="md:w-5/12 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                BrightLoop
              </span>
            </Link>

            <div className="pt-4 space-y-2">
              <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white">
                Welcome in, <span className="font-semibold block">Subscriber</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Single unified platform covering Product Catalog → Plans → Quotes → Subscriptions → Invoicing → Automated Billing.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 pt-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Idempotent billing & month-end clamping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Strict server-side customer isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Real-time MRR & revenue analytics</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-4">
            <span>© 2026 BrightLoop</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Right Side: 3-Role Interactive Sign-In Card */}
        <div className="flex-1 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-5">
          {/* Role Tabs */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Select Workspace Portal
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
              {(["ADMIN", "STAFF", "CUSTOMER"] as RoleType[]).map((role) => {
                const isSelected = activeRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all duration-150 ${
                      isSelected
                        ? "bg-[#181D24] text-white dark:bg-amber-400 dark:text-slate-900 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {role === "ADMIN" ? "Admin" : role === "STAFF" ? "Staff" : "Customer"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Spotlight Info with 1-Click Autofill */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-amber-300 block">
                {currentPreset.title}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-amber-400/80">
                {currentPreset.badge}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[11px] h-7 gap-1 rounded-full border-amber-300 dark:border-amber-700 text-slate-800 dark:text-amber-300 hover:bg-amber-100"
              onClick={() => {
                setEmail(currentPreset.email);
                setPassword(currentPreset.password);
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Autofill Demo
            </Button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••"
                className="h-10 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#181D24] hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-slate-900 font-bold text-xs shadow-sm gap-2 mt-2"
              isLoading={loading}
            >
              Sign In as {currentPreset.title} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-1">
            New customer?{" "}
            <Link href="/signup" className="font-semibold text-slate-900 dark:text-white underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
