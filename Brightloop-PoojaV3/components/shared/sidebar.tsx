"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Percent,
  Receipt,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role?: "ADMIN" | "STAFF" | "CUSTOMER";
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({
  role = "ADMIN",
  collapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const adminNav = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "Catalog & Pricing",
      items: [
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Plans", href: "/admin/plans", icon: Layers },
        { label: "Taxes", href: "/admin/taxes", icon: Percent },
        { label: "Discounts", href: "/admin/discounts", icon: Sparkles },
      ],
    },
    {
      group: "Sales & Contracts",
      items: [
        {
          label: "Quotation Templates",
          href: "/admin/quotation-templates",
          icon: FileSpreadsheet,
        },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: Repeat },
        { label: "Invoices", href: "/admin/invoices", icon: FileText },
        { label: "Payments", href: "/admin/payments", icon: CreditCard },
      ],
    },
    {
      group: "People",
      items: [
        { label: "Customers", href: "/admin/customers", icon: Users },
        { label: "Staff", href: "/admin/staff", icon: UserCheck },
      ],
    },
  ];

  const staffNav = [
    {
      group: "Operations",
      items: [
        { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
        { label: "Customers", href: "/staff/customers", icon: Users },
        { label: "Subscriptions", href: "/staff/subscriptions", icon: Repeat },
        { label: "Invoices", href: "/staff/invoices", icon: FileText },
        { label: "Payments", href: "/staff/payments", icon: CreditCard },
      ],
    },
  ];

  const customerNav = [
    {
      group: "Portal",
      items: [
        { label: "My Subscriptions", href: "/portal/subscriptions", icon: Repeat },
        { label: "My Invoices", href: "/portal/invoices", icon: FileText },
        { label: "My Profile", href: "/portal/profile", icon: Users },
      ],
    },
  ];

  const sections =
    role === "ADMIN" ? adminNav : role === "STAFF" ? staffNav : customerNav;

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30",
        collapsed ? "w-[72px]" : "w-[240px]",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 text-white font-heading font-bold shadow-sm shrink-0">
            B
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                BrightLoop
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {role}
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {section.group}
              </h4>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                    collapsed && "justify-center px-0 py-2.5"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Left accent bar on active */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User / Logout Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/api/auth/logout"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </Link>
      </div>
    </aside>
  );
}

