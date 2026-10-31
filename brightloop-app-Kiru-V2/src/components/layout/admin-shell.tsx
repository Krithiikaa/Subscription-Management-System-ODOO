"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ReducedMotionToggle } from "@/components/shared/reduced-motion-toggle";
import { LogoutButton } from "@/components/shared/logout-button";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const DASHBOARD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const STAFF_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

function BrandMark() {
  return (
    <div className="app-sidebar-brand">
      <div
        style={{
          width: 28, height: 28, borderRadius: 7,
          background: "var(--accent)", color: "var(--accent-contrast)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 12c-2.5 0-4-2-4-4s1.5-4 4-4 4 2 4 4-1.5 4-4 4z" />
          <path d="M16 12c2.5 0 4 2 4 4s-1.5 4-4 4-4-2-4-4 1.5-4 4-4z" />
        </svg>
      </div>
      <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.0625rem" }}>
        Brightloop
      </span>
    </div>
  );
}

export function AdminShell({
  children,
  role,
  name,
}: {
  children: React.ReactNode;
  role: "ADMIN" | "STAFF";
  name: string;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: DASHBOARD_ICON },
    ...(role === "ADMIN" ? [{ href: "/admin/staff", label: "Staff", icon: STAFF_ICON }] : []),
  ];

  const pageTitle = navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandMark />
        <nav className="app-sidebar-nav">
          <span className="app-nav-group-label">{role === "ADMIN" ? "Admin" : "Staff"}</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`app-nav-item${pathname.startsWith(item.href) ? " active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="app-sidebar-footer">
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <h1 className="app-topbar-title">{pageTitle}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <ReducedMotionToggle />
            <ThemeToggle />
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
