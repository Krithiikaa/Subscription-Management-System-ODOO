"use client";

import * as React from "react";
import { Search, Bell, Menu, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Breadcrumbs, BreadcrumbItem } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name?: string;
    email?: string;
    role?: "ADMIN" | "STAFF" | "CUSTOMER";
  };
  onOpenCommandPalette?: () => void;
  onToggleMobileMenu?: () => void;
}

export function TopBar({
  breadcrumbs = [{ label: "Dashboard" }],
  user = { name: "Pooja", role: "ADMIN", email: "admin@brightloop.io" },
  onOpenCommandPalette,
  onToggleMobileMenu,
}: TopBarProps) {
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "STAFF":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-slate-500"
            onClick={onToggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Right: Search trigger, Theme, Notifications, Role Chip, User */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Quick search...</span>
          <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Role Chip */}
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
            user.role
          )}`}
        >
          <Shield className="w-3 h-3" />
          <span>{user.role || "CUSTOMER"}</span>
        </div>

        {/* User Avatar Initials */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
          </div>
        </div>
      </div>
    </header>
  );
}

