"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Shield,
  Briefcase,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  TrendingUp,
  Award,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 flex items-center justify-center bg-[#8E9AA8] dark:bg-[#070B15] font-sans transition-colors duration-300">
      {/* Outer Rounded Container */}
      <div className="w-full max-w-[1440px] rounded-[2rem] sm:rounded-[2.5rem] crextio-surface border border-white/60 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-10 flex flex-col min-h-[92vh]">
        {/* Top Header Pill Bar */}
        <header className="w-full flex items-center justify-between gap-4 pb-8 border-b border-slate-200/60 dark:border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-slate-300 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEB70F]" />
            <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              BrightLoop
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#181D24] text-white shadow-sm"
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

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <ThemeToggle />
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#181D24] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Section (BrightLoop.com/about exact template) */}
        <section className="py-12 sm:py-16 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FEB70F]" />
            <span>BrightLoop Story & Mission</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Welcome to <span className="font-serif italic font-normal text-[#181D24] dark:text-[#FEB70F]">BrightLoop</span>.
          </h1>

          <p className="text-lg sm:text-2xl font-light text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We’re on a mission to help{" "}
            <span className="font-semibold text-slate-900 dark:text-white">1,000 founders and businesses succeed</span>,
            and we hope you’ll join us.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#181D24] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
            >
              Get Started with BrightLoop <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm"
            >
              Explore Live Demo
            </Link>
          </div>
        </section>

        {/* Narrative & Philosophy */}
        <section className="py-8 border-y border-slate-200/60 dark:border-slate-800">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-slate-900 dark:text-white">
              “Built by founders and executives who wanted a better way.”
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              We’ve spent time as founders and as executives. As founders, we wanted a reliable way to manage
              subscription lifecycle relationships without the chaos of spreadsheets, delayed invoices, and mismatched payments.
              As executives, we needed real-time MRR clarity, automated billing engines, and strict financial consistency.
              We built BrightLoop to do both.
            </p>
          </div>
        </section>

        {/* Leadership Team (BrightLoop Co-founders) */}
        <section className="py-12 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#FEB70F]">Our Leadership</h3>
            <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
              Meet the <span className="font-semibold">Team</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Antony Brydon */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Antony Brydon</h3>
                  <span className="text-xs font-semibold text-amber-500">CEO & Co-founder</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#181D24] text-white flex items-center justify-center font-bold text-xs">
                  AB
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Antony leads market and vision at BrightLoop. Prior roles include CEO & Co-founder of Directly
                (backed by Microsoft M12 Ventures & Samsung, acquired by Movate); CEO & Co-founder of Visible Path
                (backed by Kleiner Perkins, acquired by Dun & Bradstreet), GM at EMusic (NASDAQ: EMUS), and CEO at IUMA.
              </p>
            </div>

            {/* Jeff Patterson */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Jeff Patterson</h3>
                  <span className="text-xs font-semibold text-amber-500">Head of Product & Co-founder</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#181D24] text-white flex items-center justify-center font-bold text-xs">
                  JP
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Jeff leads product and architecture at BrightLoop. Prior roles include CTO & Co-founder of Directly
                (backed by Microsoft M12 Ventures & Samsung, acquired by Movate); CTO & Co-founder of Visible Path
                (backed by Kleiner Perkins, acquired by Dun & Bradstreet), VP at EMusic, and CTO at IUMA.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Core Engineering Pillars */}
        <section className="py-10 border-t border-slate-200/60 dark:border-slate-800">
          <div className="text-center space-y-2 pb-8">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#FEB70F]">Engineered for Reliability</h3>
            <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
              Three Non-Negotiable <span className="font-semibold">Priorities</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Billing Reliability</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Idempotent Vercel Cron billing runs ensure invoices are never duplicated and billing periods are never skipped.
                Month-end clamping guarantees consistency across leap years and 30-day months.
              </p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Access Security & Isolation</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Three dedicated portals (Admin, Staff, Customer) powered by Jose JWT authentication, bcryptjs encryption,
                and server-side customer data isolation.
              </p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#181D26] border border-slate-200/80 dark:border-slate-800 shadow-crextio space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Business Consistency</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Strict state machines govern subscriptions (Draft → Quotation → Confirmed → Active) and invoices
                (Draft → Confirmed → Paid / Overdue). Zero financial floating-point errors via Prisma Decimal(12, 2).
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-10 mt-auto border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FEB70F]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">BrightLoop Software</span>
            <span>• San Francisco & Global</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-white font-semibold">About</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Portals</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
