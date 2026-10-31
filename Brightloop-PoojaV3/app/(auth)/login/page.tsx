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
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
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
  themeColor: string;
  badgeClass: string;
  icon: any;
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
    themeColor: "indigo",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    icon: Shield,
  },
  STAFF: {
    role: "STAFF",
    title: "Staff Workspace",
    badge: "Operations & Sales",
    description: "Manage day-to-day customer accounts, create quotes, track invoices & log payments.",
    email: "staff.arun@brightloop.io",
    password: "BrightLoop@2026",
    targetDashboard: "/staff/dashboard",
    themeColor: "blue",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: Briefcase,
  },
  CUSTOMER: {
    role: "CUSTOMER",
    title: "Customer Portal",
    badge: "Self-Service",
    description: "View active subscriptions, pause/resume services, and download printable tax invoices.",
    email: "contact@apexretail.in",
    password: "BrightLoop@2026",
    targetDashboard: "/portal/subscriptions",
    themeColor: "emerald",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: User,
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
  const ActiveIcon = currentPreset.icon;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Branded Hero Panel */}
      <div className="lg:w-5/12 hero-gradient p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Top Logo */}
        <div className="space-y-6 z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-heading font-extrabold text-2xl text-white shadow-soft">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-2xl tracking-tight text-white">
                BrightLoop
              </span>
              <span className="text-[11px] text-indigo-100 tracking-wider uppercase font-semibold">
                Subscription Engine V2
              </span>
            </div>
          </Link>

          <div className="pt-12 sm:pt-16 space-y-4 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Full lifecycle subscription platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Orchestrate revenue with <span className="font-serif italic font-normal text-white">precision</span>.
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Product catalog, customized quotation templates, automated cron billing, and server-isolated customer portals.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4 max-w-md pt-8 z-10">
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Month-end clamped, idempotent billing engine</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Server-side tenant isolation & strict role security</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-indigo-50">
            <div className="p-1 rounded-full bg-white/20 shrink-0">
              <Zap className="w-4 h-4 text-emerald-300" />
            </div>
            <span>Sub-2 second SQL aggregate revenue metrics</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-xs text-indigo-200 z-10 flex items-center justify-between">
          <span>© 2026 BrightLoop Technologies Inc.</span>
          <span className="font-mono text-[11px] opacity-75">v2.0-Production</span>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Form Card with 3 Role Tabs */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top bar with Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Select your portal to sign in:
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">Theme:</span>
            <div className="p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-300/40 dark:border-slate-700/40 shadow-sm">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto space-y-6">
          {/* Role Selector Tabs (3 Roles) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Choose Workspace Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {(["ADMIN", "STAFF", "CUSTOMER"] as RoleType[]).map((role) => {
                const preset = ROLE_PRESETS[role];
                const Icon = preset.icon;
                const isSelected = activeRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700 scale-[1.02]"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                    <span>{role === "ADMIN" ? "Admin" : role === "STAFF" ? "Staff" : "Customer"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Info Card with 1-Click Demo Fill */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">
                    {currentPreset.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${currentPreset.badgeClass}`}>
                    {currentPreset.badge}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400"
                onClick={() => {
                  setEmail(currentPreset.email);
                  setPassword(currentPreset.password);
                }}
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> Autofill Demo
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentPreset.description}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
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
                className="h-11 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm gap-2"
              isLoading={loading}
            >
              Sign In to {currentPreset.title} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Sign Up Footer */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Need a new organization subscription?{" "}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Register Customer Portal
            </Link>
          </div>
        </div>

        {/* Subtle footer */}
        <div className="text-center pt-8 text-[11px] text-slate-400 dark:text-slate-600">
          Secure JWT HttpOnly authentication • Strict Server-Side RBAC
        </div>
      </div>
    </div>
  );
}
