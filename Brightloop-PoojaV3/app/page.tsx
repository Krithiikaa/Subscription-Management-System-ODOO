import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Shield,
  Briefcase,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Repeat,
  Receipt,
  BarChart3,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-heading font-extrabold text-xl text-white shadow-soft">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                BrightLoop
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-semibold">
                Subscription Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Ready</span>
            </div>

            <ThemeToggle />

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all duration-150"
            >
              Access Portals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>BrightLoop 2.0 Enterprise Subscription Suite</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Run your recurring revenue with{" "}
            <span className="font-serif italic font-normal text-indigo-600 dark:text-indigo-400">
              effortless elegance
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A single unified platform spanning the full subscription lifecycle:
            Product Catalog → Plans → Quotations → Subscriptions → Invoicing → Automated Billing → Financial Reporting.
          </p>
        </div>

        {/* 3 Interactive Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Admin Card */}
          <div className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Role: ADMIN
                </span>
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                  Admin Console
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Control products, brand variants (+₹560 Odoo), pricing plans, GST taxes, discount rules, staff roles, and execute on-demand billing runs.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time MRR & revenue dashboards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Execute idempotent billing runs</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              >
                Sign In as Admin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Staff Card */}
          <div className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Role: STAFF
                </span>
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                  Staff Workspace
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Empower your sales and operations team. Draft quotations, convert to active subscriptions, record invoice payments, and chase overdue dues.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Draft & confirm quotations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Record payments & manage accounts</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                Sign In as Staff <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Customer Card */}
          <div className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Role: CUSTOMER
                </span>
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                  Customer Portal
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Zero-friction self-service for clients. Inspect active subscriptions, pause or resume services, and print A4 PDF tax invoices anytime.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Self-serve pause & resume</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Download & print GST invoices</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                Sign In as Customer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-soft">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-300">Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Built with zero shortcuts.</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every route runs on Node.js runtime with server-side Prisma transactions, mathematical decimal calculations (never floating point money), strict state transitions, and server-side customer isolation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        BrightLoop Subscription Management System • Fully Tested with Vitest & Next.js 16
      </footer>
    </div>
  );
}
