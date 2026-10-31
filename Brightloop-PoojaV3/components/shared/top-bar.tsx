"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Bell, Settings, Search, Menu, LogOut, Shield } from "lucide-react";

interface TopBarProps {
  role?: "ADMIN" | "STAFF" | "CUSTOMER";
  user?: {
    name?: string;
    email?: string;
    role?: "ADMIN" | "STAFF" | "CUSTOMER";
  };
  onToggleMobileMenu?: () => void;
}

export function TopBar({
  role = "ADMIN",
  user = { name: "Pooja", role: "ADMIN", email: "admin@brightloop.io" },
  onToggleMobileMenu,
}: TopBarProps) {
  const pathname = usePathname();

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
    { label: "Invoices", href: "/admin/invoices" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Products", href: "/admin/products" },
    { label: "Plans", href: "/admin/plans" },
    { label: "About", href: "/about" },
  ];

  const staffNav = [
    { label: "Dashboard", href: "/staff/dashboard" },
    { label: "Customers", href: "/staff/customers" },
    { label: "Subscriptions", href: "/staff/subscriptions" },
    { label: "Invoices", href: "/staff/invoices" },
    { label: "Payments", href: "/staff/payments" },
    { label: "About", href: "/about" },
  ];

  const customerNav = [
    { label: "My Subscriptions", href: "/portal/subscriptions" },
    { label: "My Invoices", href: "/portal/invoices" },
    { label: "My Profile", href: "/portal/profile" },
    { label: "About", href: "/about" },
  ];

  const navItems = role === "ADMIN" ? adminNav : role === "STAFF" ? staffNav : customerNav;

  return (
    <header className="w-full flex items-center justify-between gap-4 py-4 px-2 sm:px-4">
      {/* Left: Brand Logo in a clean rounded pill */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            BrightLoop
          </span>
        </Link>
      </div>

      {/* Center: Horizontal Navigation Pill Bar */}
      <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#181D24] dark:bg-amber-400 text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-700/60"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Action Icons: Settings, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2">
        {/* Role Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
          <Shield className="w-3 h-3 text-amber-500" />
          <span>{role}</span>
        </div>

        {/* Theme Toggle Pill */}
        <div className="flex items-center justify-center p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <ThemeToggle />
        </div>

        {/* Notification Bell Pill */}
        <button
          className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Sign Out Pill */}
        <Link
          href="/api/auth/logout"
          className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Link>

        {/* Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#181D24] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-slate-700">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "PO"}
          </div>
        </div>
      </div>
    </header>
  );
}
