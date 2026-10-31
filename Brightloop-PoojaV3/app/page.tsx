"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Canvas3D } from "@/components/landing/canvas-3d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Briefcase,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Play,
  RotateCw,
  Clock,
  ArrowUpRight,
  ChevronDown,
  Bell,
  Settings,
  Zap,
  Layers,
  TrendingUp,
  Receipt,
  FileCheck,
  CreditCard,
  Lock,
} from "lucide-react";

type RoleType = "ADMIN" | "STAFF" | "CUSTOMER";

interface RolePreset {
  role: RoleType;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  email: string;
  password: string;
  targetDashboard: string;
  icon: any;
  accent: string;
}

const ROLE_PRESETS: Record<RoleType, RolePreset> = {
  ADMIN: {
    role: "ADMIN",
    title: "Admin Console",
    badge: "Executive & Finance",
    tagline: "Total Business Governance",
    description: "Complete control over catalog, brand variants (+₹560 Odoo), GST taxes, discount rules, staff roles, and idempotent billing engine runs.",
    email: "admin@brightloop.io",
    password: "BrightLoop@2026",
    targetDashboard: "/admin/dashboard",
    icon: Shield,
    accent: "text-amber-500",
  },
  STAFF: {
    role: "STAFF",
    title: "Staff Workspace",
    badge: "Operations & Sales",
    tagline: "Customer & Pipeline Desk",
    description: "Prepare quotations, activate customer subscriptions, inspect draft invoices, verify bank payments, and track overdue receivables.",
    email: "staff.arun@brightloop.io",
    password: "BrightLoop@2026",
    targetDashboard: "/staff/dashboard",
    icon: Briefcase,
    accent: "text-blue-500",
  },
  CUSTOMER: {
    role: "CUSTOMER",
    title: "Customer Portal",
    badge: "Self-Service",
    tagline: "Account & Invoices",
    description: "Self-service control over active subscriptions, plan inspections, pause or resume services, and instant printable GST tax invoices.",
    email: "contact@apexretail.in",
    password: "BrightLoop@2026",
    targetDashboard: "/portal/subscriptions",
    icon: User,
    accent: "text-emerald-500",
  },
};

export default function HomePage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = React.useState<RoleType>("ADMIN");
  const [email, setEmail] = React.useState(ROLE_PRESETS.ADMIN.email);
  const [password, setPassword] = React.useState(ROLE_PRESETS.ADMIN.password);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState("");

  // 3D Card tilt state for hero card
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / rect.height) * 12,
      y: (x / rect.width) * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleRoleSelect = (role: RoleType) => {
    setActiveRole(role);
    setEmail(ROLE_PRESETS[role].email);
    setPassword(ROLE_PRESETS[role].password);
    setAuthError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

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
      setAuthError(err.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  const currentPreset = ROLE_PRESETS[activeRole];
  const CurrentIcon = currentPreset.icon;

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 flex items-center justify-center bg-[#8E9AA8] dark:bg-[#070B15] font-sans transition-colors duration-300">
      {/* Outer Rounded Container */}
      <div className="relative w-full max-w-[1440px] rounded-[2rem] sm:rounded-[2.5rem] crextio-surface border border-white/60 dark:border-slate-800 shadow-2xl overflow-hidden p-4 sm:p-8 flex flex-col min-h-[92vh]">
        {/* Interactive 3D Canvas in Hero Background */}
        <Canvas3D />

        {/* Top Header Pill Bar */}
        <header className="relative z-10 w-full flex items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-slate-300 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEB70F] animate-pulse" />
              <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                BrightLoop
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#181D24] text-white shadow-sm"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              About
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Admin
            </Link>
            <Link
              href="/staff/dashboard"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Staff
            </Link>
            <Link
              href="/portal/subscriptions"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Customer
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <ThemeToggle />
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#181D24] text-white text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors"
            >
              Full Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* 3D Animated Hero Section with 3-Role Interactive Sign-In Terminal */}
        <section className="relative z-10 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Powerful Copy & Value Metrics */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FEB70F]" />
              <span>BrightLoop 2.0 • Enterprise Subscription Engine</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Run recurring revenue with{" "}
                <span className="font-serif italic font-normal text-[#181D24] dark:text-[#FEB70F]">
                  effortless elegance.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                A single unified platform replacing spreadsheets, manual renewals, and prepared invoices.
                Seamless pipeline: Product Setup → Plans → Quotes → Subscriptions → Automated Invoicing → Payments.
              </p>
            </div>

            {/* 3 Key Reliability Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FEB70F]" />
                <span>Idempotent Vercel Cron</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FEB70F]" />
                <span>Strict Customer Isolation</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FEB70F]" />
                <span>Zero Floating Point Math</span>
              </div>
            </div>

            {/* Big Geometric Metric Counters */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 max-w-lg">
              <div>
                <span className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight block">
                  1,000+
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Active Startups</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight block">
                  ₹12.4M
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Revenue Run</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight block">
                  99.98%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Reliability</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Sign-In Terminal with 3 Role Tabs */}
          <div
            className="lg:col-span-5 perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              className="p-6 sm:p-7 rounded-[2.5rem] bg-white/95 dark:bg-[#181D26]/95 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 shadow-2xl space-y-5"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Portal Sign-In
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  3 Role Access
                </span>
              </div>

              {/* 3 Role Selection Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
                {(["ADMIN", "STAFF", "CUSTOMER"] as RoleType[]).map((r) => {
                  const isSelected = activeRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-[#181D24] text-white dark:bg-[#FEB70F] dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {r === "ADMIN" ? "Admin" : r === "STAFF" ? "Staff" : "Customer"}
                    </button>
                  );
                })}
              </div>

              {/* Selected Role Info Banner & Autofill Action */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CurrentIcon className={`w-3.5 h-3.5 ${currentPreset.accent}`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-amber-300">
                      {currentPreset.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-amber-400/80 block leading-tight">
                    {currentPreset.badge}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(currentPreset.email);
                    setPassword(currentPreset.password);
                  }}
                  className="text-[11px] h-7 gap-1 rounded-full border-amber-300 dark:border-amber-700 text-slate-800 dark:text-amber-300 hover:bg-amber-100 shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" /> Autofill Demo
                </Button>
              </div>

              {/* Auth Error Banner */}
              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-600">
                  {authError}
                </div>
              )}

              {/* Real Working Sign-In Form */}
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@brightloop.io"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[10px] text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={authLoading}
                  className="w-full h-10 rounded-xl bg-[#181D24] hover:bg-slate-800 text-white dark:bg-[#FEB70F] dark:hover:bg-amber-500 dark:text-slate-900 font-bold text-xs shadow-sm gap-2 mt-2"
                >
                  Sign In as {currentPreset.title} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </form>

              {/* Direct Workspace Launcher Links */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <Link
                  href={currentPreset.targetDashboard}
                  className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-[#FEB70F] inline-flex items-center gap-1"
                >
                  Launch Workspace Directly <ArrowUpRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/signup"
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Portals Feature Breakdown (3D Bento Cards) */}
        <section className="relative z-10 py-8 border-t border-slate-200/60 dark:border-slate-800">
          <div className="text-center space-y-2 pb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FEB70F]">
              Tailored Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white">
              Three Dedicated <span className="font-semibold">Workspaces</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Admin */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Executive
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Admin Console</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full governance: Products, brand variants (+₹560 Odoo), pricing plans, GST tax rates, discount rules, staff roles, and idempotent billing runs.
              </p>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-[#FEB70F] hover:underline"
              >
                Access Admin Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Staff */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Operations
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Staff Workspace</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sales & day-to-day operations: Draft customer quotations, convert to active subscriptions, inspect draft invoices, verify payments, and log bank wires.
              </p>
              <Link
                href="/staff/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Access Staff Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Customer */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Self-Service
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Customer Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Self-service customer center: Inspect active plans, contract timelines, pause or resume services, and print compliant GST tax invoices.
              </p>
              <Link
                href="/portal/subscriptions"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Access Customer Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Bento Widget Columns (Crextio Aesthetic) */}
        <section className="relative z-10 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Column 1: User Spotlight Card (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio">
              <div className="space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                  <div className="self-end px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-bold shadow-sm">
                    $1,200
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                      Lora Piterson
                    </h3>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      UX/UI Designer
                    </p>
                  </div>
                </div>

                {/* Accordion List */}
                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300">
                    <span>Pension contributions</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-white">Devices</span>
                      <span className="text-[10px] text-slate-400">•••</span>
                    </div>
                    <div className="text-[11px] text-slate-500">MacBook Air — M1 16GB</div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300">
                    <span>Compensation Summary</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300">
                    <span>Employee Benefits</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Progress Widget with Pill Bars (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Progress</span>
                  <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-slate-900 dark:text-white">
                    6.1 h
                  </span>
                  <span className="text-[11px] text-slate-400">Work Time this week</span>
                </div>
              </div>

              {/* Vertical Pill Bar Graph with Amber Highlight */}
              <div className="pt-6">
                <div className="flex items-end justify-between gap-2 h-36 px-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2.5 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] text-slate-400 font-medium">S</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2.5 h-20 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="text-[10px] text-slate-400 font-medium">M</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2.5 h-16 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="text-[10px] text-slate-400 font-medium">T</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2.5 h-22 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="text-[10px] text-slate-400 font-medium">W</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2.5 h-24 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#181D24] dark:bg-slate-100" />
                    <span className="text-[10px] text-slate-400 font-medium">T</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 relative">
                    <span className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-[#FEB70F] text-slate-900 text-[9px] font-bold shadow-sm whitespace-nowrap">
                      5h 23m
                    </span>
                    <div className="w-2.5 h-28 rounded-full bg-[#FEB70F]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FEB70F]" />
                    <span className="text-[10px] text-amber-500 font-bold">F</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2.5 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] text-slate-400 font-medium">S</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Time Tracker Circular Ring (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Time tracker</span>
                <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Circular Ring with Yellow Stroke */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#FEB70F] transition-all duration-500"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="75"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-2xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                      02:35
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                      Work Time
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <div className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Column 4: Dark Charcoal Onboarding Task Card (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-[2rem] bg-[#181D24] text-white shadow-crextio-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">Onboarding Task</h3>
                    <span className="text-[10px] text-slate-400">Setup checklist</span>
                  </div>
                  <span className="text-2xl font-light text-white tabular-nums">2/8</span>
                </div>

                {/* Segmented Yellow Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div className="w-[30%] h-full bg-[#FEB70F] rounded-full" />
                </div>

                {/* Tasks with yellow checkmarks */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-[11px]">Interview — Sep 13, 08:30</span>
                    <CheckCircle2 className="w-4 h-4 text-[#FEB70F] shrink-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-[11px]">Team-Meeting — Sep 13, 10:30</span>
                    <CheckCircle2 className="w-4 h-4 text-[#FEB70F] shrink-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Project Update — Sep 13, 13:00</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Discuss Q3 Goals — Sep 13, 14:45</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">HR Policy Review — Sep 13, 16:30</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-[#FEB70F] hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-sm transition-colors"
                >
                  Access Workspaces <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* September 2024 Schedule Calendar */}
        <section className="relative z-10 pt-2 pb-6">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-medium">August</span>
              <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                September 2024
              </span>
              <span className="text-xs text-slate-400 font-medium">October</span>
            </div>

            <div className="grid grid-cols-6 gap-2 text-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
              <div><span className="text-slate-400 block text-[10px]">Mon</span><span className="font-bold">22</span></div>
              <div><span className="text-slate-400 block text-[10px]">Tue</span><span className="font-bold">23</span></div>
              <div><span className="text-slate-400 block text-[10px]">Wed</span><span className="font-bold">24</span></div>
              <div><span className="text-slate-400 block text-[10px]">Thu</span><span className="font-bold">25</span></div>
              <div><span className="text-slate-400 block text-[10px]">Fri</span><span className="font-bold text-amber-500">26</span></div>
              <div><span className="text-slate-400 block text-[10px]">Sat</span><span className="font-bold">27</span></div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400 w-16 text-[11px]">8:00 am</span>
                <div className="flex-1 p-3 rounded-2xl bg-[#181D24] text-white flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs">Weekly Team Sync</span>
                    <span className="text-[10px] text-slate-400 block">Discuss progress on projects</span>
                  </div>
                  <div className="flex -space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FEB70F] border border-white text-slate-900 text-[9px] font-bold flex items-center justify-center">LP</span>
                    <span className="w-5 h-5 rounded-full bg-slate-700 border border-white text-white text-[9px] font-bold flex items-center justify-center">PA</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400 w-16 text-[11px]">10:00 am</span>
                <div className="flex-1 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-amber-200">Onboarding Session</span>
                    <span className="text-[10px] text-slate-500 dark:text-amber-400/80 block">Introduction for new hires</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEB70F] text-slate-900 font-bold text-[9px]">Live</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About BrightLoop Section (Inspired by brightloop.com/about) */}
        <section className="relative z-10 pt-4 mt-auto border-t border-slate-200/60 dark:border-slate-800">
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FEB70F] block">
                  About BrightLoop
                </span>
                <h2 className="text-2xl font-light text-slate-900 dark:text-white">
                  Built by founders and executives who wanted a <span className="font-semibold">better way</span>.
                </h2>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-200 transition-colors shrink-0"
              >
                Read Full Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              We’ve spent time as founders and as executives. As founders, we wanted a better way to build relationships with
              subscribers and manage billing without manual spreadsheets. As executives, we needed automated billing engines,
              idempotent cron scheduling, and strict customer isolation. We built BrightLoop to do both.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Antony Brydon</span>
                <span className="text-[10px] text-amber-500 font-semibold block">CEO & Co-founder</span>
                <span className="text-[11px] text-slate-500 block leading-snug">
                  Former CEO & Co-founder at Directly (backed by Microsoft M12 & Samsung) and Visible Path (backed by Kleiner Perkins).
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Jeff Patterson</span>
                <span className="text-[10px] text-amber-500 font-semibold block">Head of Product & Co-founder</span>
                <span className="text-[11px] text-slate-500 block leading-snug">
                  Former CTO & Co-founder at Directly and Visible Path; VP at EMusic and CTO at IUMA.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 pt-6 mt-6 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FEB70F]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">BrightLoop Software</span>
            <span>• San Francisco & Global</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-white">About</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Portals</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
