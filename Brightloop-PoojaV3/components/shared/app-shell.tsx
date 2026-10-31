"use client";

import * as React from "react";
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
  user,
}: AppShellProps) {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 flex items-center justify-center bg-[#8E9AA8] dark:bg-[#0B0E14] transition-colors duration-300 font-sans">
      {/* Outer Rounded Crextio/Nixtio App Container */}
      <div className="w-full max-w-[1440px] rounded-[2rem] sm:rounded-[2.5rem] crextio-surface border border-white/60 dark:border-slate-800 shadow-2xl overflow-hidden p-4 sm:p-8 flex flex-col min-h-[92vh]">
        {/* Top Navbar */}
        <TopBar role={role} user={user} />

        {/* Main Content Area */}
        <main className="flex-1 w-full pt-4 sm:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
