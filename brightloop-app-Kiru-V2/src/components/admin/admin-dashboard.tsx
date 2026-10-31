"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Layers,
  ArrowUpRight,
  Play,
  Pause,
  Bell,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  ShieldCheck,
  TrendingUp,
  Building2,
  CreditCard,
  Laptop,
  Sparkles,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import { PRODUCT_DEPARTMENTS } from "@/lib/departments";

export type AdminDashboardProps = {
  userName: string;
  userRole: "ADMIN" | "STAFF";
  initialStats?: {
    activeSubscriptions: number;
    totalRevenueMRR: number;
    totalRevenueARR: number;
    totalCustomers: number;
    activeStaff: number;
    activeCloudInstances: number;
    retentionRate: number;
  };
};

// Initial realistic live invoices data with Indian GST 18% compliance
const INITIAL_INVOICES = [
  {
    id: "INV-2026-8801",
    customer: "Tata Consultancy & Tech Services",
    contactEmail: "procurement@tata.com",
    product: "BrightCloud Enterprise",
    department: "Cloud Infrastructure & DevOps",
    amount: 148000,
    gstAmount: 26640,
    total: 174640,
    status: "PAID",
    paymentMode: "UPI Instant QR (Razorpay)",
    signCode: "SIG-DEPT-CLD-04",
    signedBy: "Arun Prakash",
    date: "2026-10-31",
  },
  {
    id: "INV-2026-8802",
    customer: "Infosys Cloud Solutions Ltd",
    contactEmail: "billing@infosys.com",
    product: "BrightAnalytics Pro Suite",
    department: "Data Intelligence & Analytics",
    amount: 92000,
    gstAmount: 16560,
    total: 108560,
    status: "PAID",
    paymentMode: "Corporate NetBanking (HDFC)",
    signCode: "SIG-DEPT-DATA-02",
    signedBy: "Deepa Verma",
    date: "2026-10-30",
  },
  {
    id: "INV-2026-8803",
    customer: "Wipro Enterprise Digital",
    contactEmail: "accounts@wipro.com",
    product: "BrightSecure Identity Suite",
    department: "Information Security & Identity",
    amount: 185000,
    gstAmount: 33300,
    total: 218300,
    status: "PENDING",
    paymentMode: "Real-Time Bank Transfer (NEFT)",
    signCode: "SIG-DEPT-SEC-05",
    signedBy: "Meera Krishnan",
    date: "2026-10-29",
  },
  {
    id: "INV-2026-8804",
    customer: "Reliance Jio Platforms",
    contactEmail: "vendor@jio.com",
    product: "BrightMail High-Throughput",
    department: "Cloud Communications & Messaging",
    amount: 76000,
    gstAmount: 13680,
    total: 89680,
    status: "PAID",
    paymentMode: "UPI (Paytm Business)",
    signCode: "SIG-DEPT-COMM-01",
    signedBy: "Kiran Kumar",
    date: "2026-10-28",
  },
  {
    id: "INV-2026-8805",
    customer: "Zoho SaaS Partnerships",
    contactEmail: "finance@zoho.com",
    product: "BrightAI Automation Core",
    department: "AI & Automation Division",
    amount: 240000,
    gstAmount: 43200,
    total: 283200,
    status: "PAID",
    paymentMode: "Corporate Card (Visa Business)",
    signCode: "SIG-DEPT-AI-10",
    signedBy: "Vikram Sengupta",
    date: "2026-10-27",
  },
  {
    id: "INV-2026-8806",
    customer: "Freshworks Inc India",
    contactEmail: "admin@freshworks.com",
    product: "BrightMeet Enterprise",
    department: "Unified Collaboration",
    amount: 64000,
    gstAmount: 11520,
    total: 75520,
    status: "PENDING",
    paymentMode: "UPI Instant QR",
    signCode: "SIG-DEPT-CONF-08",
    signedBy: "Karthik Raja",
    date: "2026-10-26",
  },
];

// Interactive action items (like the Onboarding Task 2/8 black card in reference image)
const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Department Sign-off: Cloud Infrastructure",
    sub: "Arun Prakash • SIG-DEPT-CLD-04",
    done: true,
    time: "Today, 11:20 AM",
  },
  {
    id: "task-2",
    title: "Quotation #QT-2026-08 Accepted by Tata",
    sub: "Annual Enterprise License • ₹1,74,640",
    done: true,
    time: "Today, 09:45 AM",
  },
  {
    id: "task-3",
    title: "GST 18% Monthly Return Batch (Q3 Filing)",
    sub: "142 Invoices ready for tax reconciliation",
    done: false,
    time: "Due in 2 days",
  },
  {
    id: "task-4",
    title: "Annual SLA Renewal: Infosys Tech",
    sub: "Contract #SUB-8812 • BrightAnalytics",
    done: false,
    time: "Tomorrow, 4:00 PM",
  },
  {
    id: "task-5",
    title: "UPI Real-Time Webhook Reconciliation",
    sub: "Razorpay & Cashfree auto-settlement sync",
    done: false,
    time: "Scheduled 06:00 PM",
  },
  {
    id: "task-6",
    title: "Assign Reviewer: BrightSecure Division",
    sub: "Meera Krishnan assigned lead role",
    done: true,
    time: "Yesterday",
  },
];

export function AdminDashboard({
  userName,
  userRole,
  initialStats,
}: AdminDashboardProps) {
  // Navigation tabs: "dashboard" (Crextio View), "analytics" (Deep Charts), "invoices" (Live Ledger), "departments"
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "invoices" | "departments">("dashboard");

  // Timer gauge state (matching Time tracker card in image 2)
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(155); // 02:35

  // Action checklist state (matching black card on right)
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Accordion state (matching bottom-left card)
  const [openAccordion, setOpenAccordion] = useState<string | null>("departments");

  // Selected calendar day (matching bottom-center calendar)
  const [selectedDay, setSelectedDay] = useState<number>(23); // Wed 23

  // Search and filter for invoices table
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  // Live countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 180));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const completedTaskCount = tasks.filter((t) => t.done).length;

  // Filtered invoices
  const filteredInvoices = INITIAL_INVOICES.filter((inv) => {
    const matchFilter = invoiceFilter === "ALL" || inv.status === invoiceFilter;
    const matchSearch =
      inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customer.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.product.toLowerCase().includes(invoiceSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Export CSV function for GST Invoices
  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Customer",
      "Product",
      "Department",
      "Base Amount (INR)",
      "GST 18% (INR)",
      "Total Amount (INR)",
      "Status",
      "Payment Mode",
      "Sign Code",
      "Signed By",
      "Date",
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.id,
      `"${inv.customer}"`,
      `"${inv.product}"`,
      `"${inv.department}"`,
      inv.amount,
      inv.gstAmount,
      inv.total,
      inv.status,
      `"${inv.paymentMode}"`,
      inv.signCode,
      `"${inv.signedBy}"`,
      inv.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Brightloop_GST_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    activeSubscriptions: initialStats?.activeSubscriptions || 1280,
    totalRevenueMRR: initialStats?.totalRevenueMRR || 4860000,
    totalRevenueARR: initialStats?.totalRevenueARR || 58320000,
    totalCustomers: initialStats?.totalCustomers || 78,
    activeStaff: initialStats?.activeStaff || 56,
    activeCloudInstances: initialStats?.activeCloudInstances || 203,
    retentionRate: initialStats?.retentionRate || 96.4,
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-4 font-sans text-[#141A17]">
      {/* ─── Outer Container: Aesthetic Sage Green Canvas (Inspired by Reference Image 2) ─── */}
      <div className="mx-auto max-w-[1340px] rounded-[34px] bg-[#EAF4ED] p-5 sm:p-7 md:p-9 shadow-[0_25px_70px_-15px_rgba(20,50,30,0.06)] border border-[#D5EAD9]">

        {/* ─── 1. Top Pill Navigation Bar (Matching "Crextio" bar in Image 2) ─── */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-7">
          {/* Brand Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-sm tracking-tight text-[#162B1D]">Brightloop</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase">
              Admin Ops
            </span>
          </div>

          {/* Center Pill Tabs Menu (Matching image 2: [Dashboard] People Hiring Devices Apps...) */}
          <nav className="flex items-center gap-1.5 p-1.5 bg-white/70 backdrop-blur-md rounded-full border border-white/80 shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#181F1C] text-white shadow-sm"
                  : "text-[#3D5243] hover:bg-white/60"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "analytics"
                  ? "bg-[#181F1C] text-white shadow-sm"
                  : "text-[#3D5243] hover:bg-white/60"
              }`}
            >
              Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "invoices"
                  ? "bg-[#181F1C] text-white shadow-sm"
                  : "text-[#3D5243] hover:bg-white/60"
              }`}
            >
              Live Invoices & GST
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "departments"
                  ? "bg-[#181F1C] text-white shadow-sm"
                  : "text-[#3D5243] hover:bg-white/60"
              }`}
            >
              Department Routing
            </button>
            <Link
              href="/admin/staff"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#3D5243] hover:bg-white/60 transition-colors"
            >
              Staff
            </Link>
            <Link
              href="/admin/products"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#3D5243] hover:bg-white/60 transition-colors"
            >
              Products
            </Link>
          </nav>

          {/* Right Status & Profile Controls */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-full border border-white/60 text-xs text-[#2A4032]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-Time Live</span>
            </div>
            <button
              onClick={() => alert("All 10 departments and billing webhooks are operational.")}
              className="relative p-2 rounded-full bg-white/80 hover:bg-white border border-white/60 text-[#2B3F32] shadow-sm transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600" />
            </button>
            <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/80 rounded-full border border-white/60 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#18291F] max-w-[90px] truncate">{userName}</span>
            </div>
          </div>
        </header>

        {/* ─── 2. Header Welcome & Progress Bar (Matching Welcome in, + 78 56 203 in Image 2) ─── */}
        <section className="mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            {/* Left: Welcome Title & Segmented Distribution Bar */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#111915] tracking-tight">
                Welcome in,
              </h1>
              <p className="text-xs sm:text-sm text-[#4E6354] mt-1 mb-4">
                Enterprise subscription intelligence, recurring billing runs & department sign-offs
              </p>

              {/* Segmented Distribution Bar (Matches: Interviews 15% / Hired 15% / Project time 60% / Output 10%) */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <div className="px-3.5 py-1.5 rounded-full bg-[#181F1C] text-white text-xs font-medium shadow-sm flex items-center gap-2">
                  <span>Enterprise</span>
                  <span className="text-white/60 font-mono text-[11px]">15%</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-[#74A783] text-white text-xs font-medium shadow-sm flex items-center gap-2">
                  <span>Active Subscriptions</span>
                  <span className="text-white/70 font-mono text-[11px]">25%</span>
                </div>
                {/* Diagonal striped bar (Matching project time 60% in reference) */}
                <div className="h-8 px-5 rounded-full flex items-center gap-2 text-white text-xs font-semibold shadow-sm bg-[repeating-linear-gradient(45deg,#2E7D32,#2E7D32_10px,#34A853_10px,#34A853_20px)] min-w-[140px] sm:min-w-[170px] justify-between">
                  <span>Cloud Delivery</span>
                  <span className="font-mono text-[11px]">60%</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-white/70 border border-emerald-300 text-[#1F3E2B] text-xs font-medium flex items-center gap-2">
                  <span>GST 18% Verified</span>
                  <span className="text-emerald-700 font-mono text-[11px]">100%</span>
                </div>
              </div>
            </div>

            {/* Right: Big KPI Numbers (Matching 78 Employe / 56 Hirings / 203 Projects in Image 2) */}
            <div className="flex items-center gap-6 sm:gap-8 bg-white/60 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/80 self-start lg:self-auto shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-700 opacity-80" />
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-[#122318] leading-none">
                    {stats.totalCustomers}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#576F5E] font-medium mt-1">
                    Enterprise Clients
                  </div>
                </div>
              </div>

              <div className="w-px h-9 bg-emerald-200" />

              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-emerald-700 opacity-80" />
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-[#122318] leading-none">
                    {stats.activeStaff}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#576F5E] font-medium mt-1">
                    Staff Leads
                  </div>
                </div>
              </div>

              <div className="w-px h-9 bg-emerald-200" />

              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-emerald-700 opacity-80" />
                <div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-[#122318] leading-none">
                    {stats.activeCloudInstances}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#576F5E] font-medium mt-1">
                    Cloud Products
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. Main Bento Grid Content (Layout faithfully mirroring Image 2) ─── */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* ─── CARD 1: Profile & Admin Spotlight (Matches Lora Peterson card in Image 2) ─── */}
            <div className="md:col-span-3 min-h-[260px] rounded-[28px] overflow-hidden relative shadow-sm group">
              {/* Profile Background Image / Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141E18] via-[#243B2C] to-[#51765E]" />
              {/* Subtle ambient lighting effect */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl" />

              {/* Aesthetic Portrait Avatar */}
              <div className="absolute inset-0 flex items-center justify-center pb-12">
                <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl relative bg-emerald-800">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-600 to-[#122E1F] flex items-center justify-center text-white font-serif text-5xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Bottom Card Details */}
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#0E1712] via-[#0E1712]/90 to-transparent flex items-end justify-between">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg tracking-tight">
                    {userName}
                  </h3>
                  <p className="text-emerald-300/80 text-xs font-medium">
                    {userRole === "ADMIN" ? "Operations Director" : "Department Lead Specialist"}
                  </p>
                </div>
                {/* Badge (Matches $1,200 pill in Image 2) */}
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-mono font-semibold border border-white/30 shadow-inner">
                  ₹1.84 Cr ARR
                </div>
              </div>
            </div>

            {/* ─── CARD 2: Progress & Revenue Velocity Bar Chart (Matches Progress 6.1h in Image 2) ─── */}
            <div className="md:col-span-3 rounded-[28px] bg-white/90 backdrop-blur-md p-5 border border-white/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#667C6E] uppercase tracking-wider">Progress</span>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="w-7 h-7 rounded-full bg-[#EDF7F0] hover:bg-[#DDF0E2] text-emerald-800 flex items-center justify-center transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-[#142319]">₹6.84L</span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    +18.4%
                  </span>
                </div>
                <p className="text-[11px] text-[#637A6C]">Collected this week via Instant UPI & RTGS</p>
              </div>

              {/* Vertical Bar Chart (Pill Bars S M T W T F S with Friday Highlight + Tooltip) */}
              <div className="pt-4 pb-1">
                {/* Floating pill tooltip above the active day (Friday) */}
                <div className="flex justify-center mb-1.5">
                  <div className="px-2.5 py-0.5 rounded-full bg-[#181F1C] text-white font-mono text-[10px] font-semibold shadow-sm">
                    ₹1.42L Today
                  </div>
                </div>

                <div className="flex items-end justify-between gap-1.5 h-28 px-1">
                  {/* Sun */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-[#E3EFE6] rounded-full h-8 flex items-end">
                      <div className="w-full bg-[#7CA888] rounded-full h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A9183]">S</span>
                  </div>
                  {/* Mon */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-[#E3EFE6] rounded-full h-16 flex items-end">
                      <div className="w-full bg-[#1E2E23] rounded-full h-11" />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A9183]">M</span>
                  </div>
                  {/* Tue */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-[#E3EFE6] rounded-full h-14 flex items-end">
                      <div className="w-full bg-[#1E2E23] rounded-full h-9" />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A9183]">T</span>
                  </div>
                  {/* Wed */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-[#E3EFE6] rounded-full h-20 flex items-end">
                      <div className="w-full bg-[#1E2E23] rounded-full h-16" />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A9183]">W</span>
                  </div>
                  {/* Thu */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-[#E3EFE6] rounded-full h-12 flex items-end">
                      <div className="w-full bg-[#1E2E23] rounded-full h-8" />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A9183]">T</span>
                  </div>
                  {/* Fri - Active highlighted day in vibrant green */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-emerald-100 rounded-full h-24 flex items-end">
                      <div className="w-full bg-emerald-600 rounded-full h-20 shadow-sm" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800">F</span>
                  </div>
                  {/* Sat */}
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-full bg-[#E3EFE6] rounded-full h-10 flex items-end">
                      <div className="w-full bg-[#7CA888] rounded-full h-6" />
                    </div>
                    <span className="text-[10px] font-medium text-[#7A9183]">S</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── CARD 3: Time Tracker / Billing Cycle Gauge (Matches Time Tracker 02:35 in Image 2) ─── */}
            <div className="md:col-span-3 rounded-[28px] bg-white/90 backdrop-blur-md p-5 border border-white/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#667C6E] uppercase tracking-wider">Time tracker</span>
                  <button
                    onClick={() => alert("Next automated recurring billing batch executes at 08:00 PM IST.")}
                    className="w-7 h-7 rounded-full bg-[#EDF7F0] hover:bg-[#DDF0E2] text-emerald-800 flex items-center justify-center transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-[#182B1F]">Next Invoicing Batch</h4>
                <p className="text-[11px] text-[#637A6C]">Auto-generating GST 18% invoices</p>
              </div>

              {/* Circular Gauge Ring */}
              <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Dashed outer background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#DCEFE3"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="3 3"
                  />
                  {/* Solid vibrant green progress arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#16A34A"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8" // ~75% complete
                  />
                </svg>

                {/* Center Timer text */}
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-2xl font-bold text-[#14261B] tracking-tight">
                    {formatTimer(timerSeconds)}
                  </span>
                  <span className="text-[10px] text-[#6B8274] font-medium">Batch Run</span>
                </div>
              </div>

              {/* Play / Pause / Alert Controls (Matches playback controls in Image 2) */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="w-9 h-9 rounded-full bg-[#181F1C] hover:bg-[#2A3530] text-white flex items-center justify-center shadow-sm transition-all"
                  title={timerRunning ? "Pause timer" : "Resume timer"}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => alert("Alarm trigger enabled for recurring GST invoice batch.")}
                  className="w-9 h-9 rounded-full bg-[#EAF5EE] hover:bg-[#DBEFE1] text-[#1E3B27] flex items-center justify-center transition-colors"
                  title="Cycle reminder"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── CARD 4 & 5 STACK: Onboarding / Retention & Floating Dark Action Center ─── */}
            <div className="md:col-span-3 flex flex-col gap-5">
              {/* Card 4: Retention & Health Metric (Matches Onboarding 18% in Image 2) */}
              <div className="rounded-[24px] bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#546C5E]">Platform Health</span>
                  <span className="text-xl font-serif font-bold text-[#132419]">
                    {stats.retentionRate}%
                  </span>
                </div>

                {/* Segmented bar 30% / 25% / 0% */}
                <div className="flex gap-1.5 h-3.5 mb-1.5">
                  <div className="flex-[3] rounded-full bg-[#181F1C]" title="Enterprise Active 82%" />
                  <div className="flex-[2] rounded-full bg-[#75A884]" title="Healthy Renewals 14%" />
                  <div className="flex-[1] rounded-full bg-[#D6EBDC]" title="At-Risk 4%" />
                </div>
                <div className="flex justify-between text-[10px] text-[#6D8576] font-medium">
                  <span>82% Active</span>
                  <span>14% Renewing</span>
                  <span>4% Review</span>
                </div>
              </div>

              {/* Card 5: Dark Floating Action Center Widget (Matches black card Onboarding Task 2/8) */}
              <div className="rounded-[26px] bg-[#161B18] text-white p-5 shadow-2xl flex-1 flex flex-col justify-between border border-white/10 relative">
                {/* Faux stack layer on top */}
                <div className="absolute -top-1.5 inset-x-5 h-2 bg-white/20 rounded-t-xl -z-10" />

                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Action Center
                    </h4>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/15 text-emerald-300 font-semibold">
                      {completedTaskCount}/{tasks.length}
                    </span>
                  </div>

                  {/* Task list with interactive checkmarks */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                          task.done ? "bg-white/5 opacity-70" : "bg-white/10 hover:bg-white/15"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${
                            task.done
                              ? "bg-emerald-500 text-white"
                              : "border border-white/40 text-transparent hover:border-emerald-400"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-medium leading-tight ${
                              task.done ? "line-through text-white/50" : "text-white"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[10px] text-emerald-300/70 truncate mt-0.5">{task.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                  <span>GST Filing Batch</span>
                  <span className="text-emerald-400 font-semibold">Ready to Sign</span>
                </div>
              </div>
            </div>

            {/* ─── CARD 6: Department Performance & Products List (Matches Bottom-Left List in Image 2) ─── */}
            <div className="md:col-span-5 rounded-[28px] bg-white/90 backdrop-blur-md p-5 border border-white/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base text-[#15251B]">Enterprise Allocations</h3>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
                    10 Divisions
                  </span>
                </div>

                {/* Expandable Accordion List */}
                <div className="space-y-2">
                  {/* Item 1: Department Staff Routing */}
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden bg-white/60">
                    <button
                      onClick={() =>
                        setOpenAccordion(openAccordion === "departments" ? null : "departments")
                      }
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-[#182A1E] hover:bg-white/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span>Department Staff Quotation Routing</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7B9284] transition-transform ${
                          openAccordion === "departments" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openAccordion === "departments" && (
                      <div className="p-3.5 pt-0 text-xs text-[#4E6455] space-y-2 border-t border-emerald-100/50">
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <div>
                            <span className="font-semibold text-[#16271C]">Cloud Infrastructure</span>
                            <span className="block text-[10px] text-[#718778]">Arun Prakash • SIG-DEPT-CLD-04</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                            Active Lead
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <div>
                            <span className="font-semibold text-[#16271C]">Data Intelligence</span>
                            <span className="block text-[10px] text-[#718778]">Deepa Verma • SIG-DEPT-DATA-02</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                            Active Lead
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <div>
                            <span className="font-semibold text-[#16271C]">AI & Automation</span>
                            <span className="block text-[10px] text-[#718778]">Vikram Sengupta • SIG-DEPT-AI-10</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                            Active Lead
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item 2: Devices & Cloud Instances */}
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden bg-white/60">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === "devices" ? null : "devices")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-[#182A1E] hover:bg-white/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Laptop className="w-4 h-4 text-emerald-700" />
                        <span>Cloud Infrastructure Instances</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7B9284] transition-transform ${
                          openAccordion === "devices" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openAccordion === "devices" && (
                      <div className="p-3.5 pt-0 text-xs text-[#4E6455] space-y-1.5 border-t border-emerald-100/50">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-[#192B1E] font-medium">AWS ap-south-1 (Mumbai Cluster)</span>
                          <span className="font-mono text-emerald-700 font-semibold">142 Pods</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-[#192B1E] font-medium">Neon PostgreSQL Serverless Pools</span>
                          <span className="font-mono text-emerald-700 font-semibold">61 DB Shards</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item 3: GST Compliance & Tax Ledger */}
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden bg-white/60">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === "gst" ? null : "gst")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-[#182A1E] hover:bg-white/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span>Indian GST 18% Compliance Ledger</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7B9284] transition-transform ${
                          openAccordion === "gst" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openAccordion === "gst" && (
                      <div className="p-3.5 pt-0 text-xs text-[#4E6455] space-y-1 border-t border-emerald-100/50">
                        <p className="text-[11px] text-[#6A8172]">
                          HSN/SAC Code: <strong className="font-mono text-[#18291F]">998313</strong> (IT Software Licensing)
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <span className="text-[10px] text-emerald-800 uppercase block font-semibold">CGST 9%</span>
                            <span className="font-mono font-bold text-emerald-950">₹4,37,400</span>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <span className="text-[10px] text-emerald-800 uppercase block font-semibold">SGST 9%</span>
                            <span className="font-mono font-bold text-emerald-950">₹4,37,400</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item 4: Payment Rails Settlement */}
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden bg-white/60">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === "payments" ? null : "payments")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-[#182A1E] hover:bg-white/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        <span>Real-Time Payment Rail Breakdown</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7B9284] transition-transform ${
                          openAccordion === "payments" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openAccordion === "payments" && (
                      <div className="p-3.5 pt-0 text-xs text-[#4E6455] space-y-1.5 border-t border-emerald-100/50">
                        <div className="flex justify-between items-center text-xs">
                          <span>UPI Instant QR / VPA</span>
                          <span className="font-semibold text-emerald-800">64% (Zero-Fee)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Corporate NetBanking (NEFT/RTGS)</span>
                          <span className="font-semibold text-emerald-800">22%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Credit / Debit Cards</span>
                          <span className="font-semibold text-emerald-800">14%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B8072]">
                <span>All 10 Departments Active</span>
                <Link href="/admin/staff" className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                  Manage Staff Assignments <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ─── CARD 7: Interactive Billing Calendar & Schedule Timeline (Matches Bottom-Center Calendar in Image 2) ─── */}
            <div className="md:col-span-7 rounded-[28px] bg-white/90 backdrop-blur-md p-5 border border-white/80 shadow-sm flex flex-col justify-between">
              <div>
                {/* Month Navigation Row (Matches "August September 2024 October" in Image 2) */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#809587] font-medium">October</span>
                    <h3 className="text-base font-serif font-bold text-[#14261B]">November 2026</h3>
                    <span className="text-xs text-[#809587] font-medium">December</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                    Auto-Schedule Active
                  </div>
                </div>

                {/* Days of week selector strip (Matches Mon 22 / Tue 23 / Wed 24 / Thu 25 / Fri 26 / Sat 27) */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {[
                    { day: "Mon", date: 22 },
                    { day: "Tue", date: 23 },
                    { day: "Wed", date: 24 },
                    { day: "Thu", date: 25 },
                    { day: "Fri", date: 26 },
                    { day: "Sat", date: 27 },
                  ].map((item) => {
                    const isSelected = selectedDay === item.date;
                    return (
                      <button
                        key={item.date}
                        onClick={() => setSelectedDay(item.date)}
                        className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all ${
                          isSelected
                            ? "bg-[#181F1C] text-white shadow-md"
                            : "bg-[#F3FAF5] hover:bg-[#E5F3E9] text-[#2F4436]"
                        }`}
                      >
                        <span className={`text-[10px] ${isSelected ? "text-white/70" : "text-[#7B9284]"}`}>
                          {item.day}
                        </span>
                        <span className="font-mono text-base font-bold mt-0.5">{item.date}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Timeline Schedule Events (Matches 8:00 am Weekly Team Sync / 10:00 am Onboarding Session in Image 2) */}
                <div className="space-y-3 pt-1 border-t border-gray-100">
                  {/* Event 1: 08:00 am - Green Pill Event */}
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-[#7B9285] w-16 pt-2">8:00 am</span>
                    <div className="flex-1 p-3 rounded-2xl bg-emerald-600 text-white shadow-sm flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-xs text-white">
                          Automated Recurring Invoicing Run (₹14.2L)
                        </h5>
                        <p className="text-[11px] text-emerald-100 mt-0.5">
                          142 Enterprise subscriptions billed with GST 18% compliance
                        </p>
                      </div>
                      {/* Avatar Stack */}
                      <div className="flex -space-x-2 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-emerald-800 border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold">
                          AP
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-900 border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold">
                          DV
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#181F1C] border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold">
                          PM
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event 2: 10:00 am - White Pill Event */}
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-[#7B9285] w-16 pt-2">10:00 am</span>
                    <div className="flex-1 p-3 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-xs text-[#132419]">
                          Department Staff Quotation Sign-off Sync
                        </h5>
                        <p className="text-[11px] text-[#5A7263] mt-0.5">
                          Digital signature verification with Arun Prakash (Cloud Division)
                        </p>
                      </div>
                      <span className="font-mono text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                        SIG-DEPT-CLD-04
                      </span>
                    </div>
                  </div>

                  {/* Event 3: 03:30 pm - Soft Mint Pill Event */}
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-[#7B9285] w-16 pt-2">3:30 pm</span>
                    <div className="flex-1 p-3 rounded-2xl bg-[#E4F3E8] border border-emerald-200/60 shadow-sm flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-xs text-[#162B1D]">
                          Razorpay & Cashfree Instant Settlement Audit
                        </h5>
                        <p className="text-[11px] text-[#4E6756] mt-0.5">
                          Net revenue reconciliation with HDFC Bank Corporate Gateway
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-900 bg-white/70 px-2 py-0.5 rounded-full">
                        Daily Sync
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B8072]">
                <span>Timeline automatically synced with GST 18% schedule</span>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  View Invoices & Receipts <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. Detailed Reports & Analytics View (When tab is active) ─── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-[26px] bg-white/90 border border-white/80 shadow-sm">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#15271D]">Revenue & Subscription Analytics</h3>
                <p className="text-xs text-[#5D7365] mt-0.5">
                  Comprehensive performance breakdown across all 10 software products & enterprise tiers
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#181F1C] hover:bg-[#2A352F] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Executive Analytics</span>
              </button>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[24px] bg-white/90 border border-emerald-100/60 shadow-sm">
                <span className="text-xs text-[#6B8274] font-medium uppercase tracking-wider">Monthly Recurring (MRR)</span>
                <div className="text-3xl font-serif font-bold text-[#122318] mt-1">₹48.60 Lakhs</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% vs last month</span>
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-white/90 border border-emerald-100/60 shadow-sm">
                <span className="text-xs text-[#6B8274] font-medium uppercase tracking-wider">Annual Run Rate (ARR)</span>
                <div className="text-3xl font-serif font-bold text-[#122318] mt-1">₹5.83 Crores</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Target: ₹6.50 Cr</span>
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-white/90 border border-emerald-100/60 shadow-sm">
                <span className="text-xs text-[#6B8274] font-medium uppercase tracking-wider">Avg Revenue Per Customer</span>
                <div className="text-3xl font-serif font-bold text-[#122318] mt-1">₹62,300</div>
                <div className="flex items-center gap-1.5 text-xs text-[#6A8173] font-medium mt-2">
                  <span>Annualized enterprise contracts</span>
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-white/90 border border-emerald-100/60 shadow-sm">
                <span className="text-xs text-[#6B8274] font-medium uppercase tracking-wider">Net Retention Rate</span>
                <div className="text-3xl font-serif font-bold text-[#122318] mt-1">96.4%</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero involuntary churn</span>
                </div>
              </div>
            </div>

            {/* Product Performance Table */}
            <div className="p-5 rounded-[26px] bg-white/90 border border-white/80 shadow-sm">
              <h4 className="font-semibold text-base text-[#15261D] mb-4">Product Category Revenue Contribution</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[#6B8274] uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Product Name</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Active Subscriptions</th>
                      <th className="pb-3 font-semibold">Monthly Revenue</th>
                      <th className="pb-3 font-semibold">GST Collected (18%)</th>
                      <th className="pb-3 font-semibold">Department Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(PRODUCT_DEPARTMENTS).map(([prodName, dept]) => (
                      <tr key={prodName} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3 font-semibold text-[#14261B]">{prodName}</td>
                        <td className="py-3 text-[#4D6555]">{dept.department}</td>
                        <td className="py-3 font-mono font-medium text-[#1A2D21]">
                          {Math.floor(prodName.length * 28 + 45)}
                        </td>
                        <td className="py-3 font-mono font-bold text-[#14261B]">
                          ₹{((prodName.length * 45000 + 120000) / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 font-mono text-emerald-800">
                          ₹{(((prodName.length * 45000 + 120000) * 0.18) / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold font-mono text-[11px]">
                            {dept.leadStaff}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── 5. Live Invoices & Indian GST 18% Ledger (When tab is active) ─── */}
        {activeTab === "invoices" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[26px] bg-white/90 border border-white/80 shadow-sm">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#14261B]">Real-Time Invoices & GST 18% Ledger</h3>
                <p className="text-xs text-[#5D7365] mt-0.5">
                  Official tax invoices compliant with Indian GST (SAC 998313) and Department Digital Signatures
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#181F1C] hover:bg-[#2A352F] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download GST CSV</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/80 border border-white/60">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#7A9184]" />
                <input
                  type="text"
                  placeholder="Search invoice number, client, or software product..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#132419] placeholder:text-[#889E90] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setInvoiceFilter("ALL")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    invoiceFilter === "ALL" ? "bg-[#181F1C] text-white" : "bg-white/60 text-[#4E6456]"
                  }`}
                >
                  All ({INITIAL_INVOICES.length})
                </button>
                <button
                  onClick={() => setInvoiceFilter("PAID")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    invoiceFilter === "PAID" ? "bg-[#181F1C] text-white" : "bg-white/60 text-[#4E6456]"
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setInvoiceFilter("PENDING")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    invoiceFilter === "PENDING" ? "bg-[#181F1C] text-white" : "bg-white/60 text-[#4E6456]"
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="rounded-[26px] bg-white/95 border border-white/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EDF7F1] border-b border-emerald-100 text-[#4F6A58] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Invoice #</th>
                      <th className="py-3 px-4 font-semibold">Client Organization</th>
                      <th className="py-3 px-4 font-semibold">Product & Dept</th>
                      <th className="py-3 px-4 font-semibold">Base Price</th>
                      <th className="py-3 px-4 font-semibold">GST (18%)</th>
                      <th className="py-3 px-4 font-semibold">Total Paid</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Department Sign-off</th>
                      <th className="py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#14261B]">{inv.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#14261B]">{inv.customer}</div>
                          <div className="text-[10px] text-[#718879]">{inv.contactEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#14261B]">{inv.product}</div>
                          <div className="text-[10px] text-emerald-800">{inv.department}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#1F3325]">
                          ₹{inv.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700">
                          ₹{inv.gstAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#122418]">
                          ₹{inv.total.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              inv.status === "PAID"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[10px] font-semibold text-emerald-800">
                            {inv.signCode}
                          </div>
                          <div className="text-[10px] text-[#6B8274]">{inv.signedBy}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() =>
                              alert(
                                `Tax Invoice ${inv.id}\nCustomer: ${inv.customer}\nTotal: ₹${inv.total}\nDepartment Signature: ${inv.signCode} by ${inv.signedBy}\nPayment: ${inv.paymentMode}`
                              )
                            }
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-[#14261B] transition-colors"
                            title="View receipt details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── 6. Department Staff Routing View (When tab is active) ─── */}
        {activeTab === "departments" && (
          <div className="space-y-5">
            <div className="p-5 rounded-[26px] bg-white/90 border border-white/80 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#14261B]">Department Staff Routing Matrix</h3>
                <p className="text-xs text-[#5D7365] mt-0.5">
                  10 active specialized product divisions responsible for quotation review and digital approvals
                </p>
              </div>
              <Link
                href="/admin/staff"
                className="px-4 py-2 rounded-full bg-[#181F1C] hover:bg-[#2A352F] text-white text-xs font-semibold shadow-sm transition-all"
              >
                Manage Staff Invitations
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(PRODUCT_DEPARTMENTS).map(([prod, info]) => (
                <div
                  key={prod}
                  className="p-5 rounded-[24px] bg-white/95 border border-emerald-100/70 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {info.approvalCode}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Authorized
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#132419]">{prod}</h4>
                    <p className="text-xs font-medium text-emerald-900/80 mt-0.5">{info.department}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
                      <div className="text-xs text-[#172A1F] font-semibold flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                          {info.leadStaff.charAt(0)}
                        </div>
                        {info.leadStaff}
                      </div>
                      <div className="text-[11px] text-[#697F71]">{info.role}</div>
                      <div className="text-[10px] font-mono text-[#82998B]">{info.email}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-[#647C6E]">Sign-off Rights</span>
                    <span className="text-emerald-700 font-semibold">Active & Live</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

