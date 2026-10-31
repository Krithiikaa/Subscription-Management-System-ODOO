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
  Play,
  RotateCw,
  Clock,
  ArrowUpRight,
  ChevronDown,
  Bell,
  Settings,
} from "lucide-react";

type RoleType = "ADMIN" | "STAFF" | "CUSTOMER";

export default function HomePage() {
  const [activeRole, setActiveRole] = React.useState<RoleType>("ADMIN");

  const roles = [
    {
      id: "ADMIN" as RoleType,
      label: "Admin Portal",
      title: "Executive & Finance",
      desc: "Full business control: products, variants, GST taxes, plans, staff accounts, and on-demand billing runs.",
      href: "/admin/dashboard",
      icon: Shield,
      badge: "Full Control",
    },
    {
      id: "STAFF" as RoleType,
      label: "Staff Workspace",
      title: "Operations & Sales",
      desc: "Prepare quotations, activate subscriptions, manage invoices, log payments, and track overdue accounts.",
      href: "/staff/dashboard",
      icon: Briefcase,
      badge: "Operations",
    },
    {
      id: "CUSTOMER" as RoleType,
      label: "Customer Portal",
      title: "Self-Service",
      desc: "Customer self-service: pause or resume services, inspect active plans, and print GST tax invoices.",
      href: "/portal/subscriptions",
      icon: User,
      badge: "Self-Service",
    },
  ];

  const currentRole = roles.find((r) => r.id === activeRole) || roles[0];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 flex items-center justify-center bg-[#8E9AA8] dark:bg-[#0B0E14] font-sans transition-colors duration-300">
      {/* Outer Rounded Crextio/Nixtio App Container */}
      <div className="w-full max-w-[1440px] rounded-[2rem] sm:rounded-[2.5rem] crextio-surface border border-white/60 dark:border-slate-800 shadow-2xl overflow-hidden p-4 sm:p-8 flex flex-col min-h-[92vh]">
        {/* Top Header Pill Bar (Exact Crextio Style) */}
        <header className="w-full flex items-center justify-between gap-4 pb-6">
          {/* Brand Logo Pill */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-slate-300 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Crextio • BrightLoop
              </span>
            </Link>
          </div>

          {/* Center Navigation Pill Bar */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <Link
              href="/admin/dashboard"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#181D24] text-white shadow-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/subscriptions"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Subscriptions
            </Link>
            <Link
              href="/admin/invoices"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Invoices
            </Link>
            <Link
              href="/admin/payments"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Payments
            </Link>
            <Link
              href="/admin/customers"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Customers
            </Link>
            <Link
              href="/admin/products"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Catalog
            </Link>
            <Link
              href="/admin/plans"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Plans
            </Link>
          </nav>

          {/* Right Icons Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <ThemeToggle />
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#181D24] text-white text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Welcoming Bar (Exact Crextio Greeting) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 pt-2">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900 dark:text-white">
              Welcome in, <span className="font-semibold">Nixtio</span>
            </h1>

            {/* Segmented Progress Pill Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Interviews</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#181D24] text-white text-[10px] font-bold">15%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Hired</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">15%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Project time</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">60%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Output</span>
                <span className="px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">10%</span>
              </div>
            </div>
          </div>

          {/* Top Right: 3 Big Geometric Number Counters (78, 56, 203) */}
          <div className="flex items-center gap-6 sm:gap-10 shrink-0">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                78
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Employe
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                56
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Hirings
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tabular-nums tracking-tight">
                203
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Projects
              </span>
            </div>
          </div>
        </div>

        {/* 4 Bento Widget Columns (Exact Crextio layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 flex-1">
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
                  <span className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[9px] font-bold shadow-sm whitespace-nowrap">
                    5h 23m
                  </span>
                  <div className="w-2.5 h-28 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
                    className="stroke-amber-400 transition-all duration-500"
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
                <div className="w-[30%] h-full bg-amber-400 rounded-full" />
              </div>

              {/* Tasks with yellow checkmarks */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-[11px]">Interview — Sep 13, 08:30</span>
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-[11px]">Team-Meeting — Sep 13, 10:30</span>
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
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
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-sm transition-colors"
              >
                Access Workspaces <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row: September 2024 Schedule Calendar (Exact Crextio calendar) */}
        <div className="pt-6">
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

            {/* Event Schedule Pills (Crextio style) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400 w-16 text-[11px]">8:00 am</span>
                <div className="flex-1 p-3 rounded-2xl bg-[#181D24] text-white flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs">Weekly Team Sync</span>
                    <span className="text-[10px] text-slate-400 block">Discuss progress on projects</span>
                  </div>
                  <div className="flex -space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 border border-white text-slate-900 text-[9px] font-bold flex items-center justify-center">LP</span>
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
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-bold text-[9px]">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
