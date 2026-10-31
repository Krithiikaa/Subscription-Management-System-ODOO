"use client";

import * as React from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { BreadcrumbItem } from "@/components/shared/breadcrumbs";

interface AppShellProps {
  children: React.ReactNode;
  role?: "ADMIN" | "STAFF" | "CUSTOMER";
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name?: string;
    email?: string;
    role?: "ADMIN" | "STAFF" | "CUSTOMER";
  };
}

export function AppShell({
  children,
  role = "ADMIN",
  breadcrumbs,
  user,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] transform bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          role={role}
          collapsed={false}
          onToggleCollapse={() => setMobileOpen(false)}
        />
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          breadcrumbs={breadcrumbs}
          user={user}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

