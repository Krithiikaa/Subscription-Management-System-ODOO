"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrightloopLogo } from "@/components/brand/brightloop-logo";
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

const BOX_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const LAYERS_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const CALENDAR_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PERCENT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const TAG_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41 11 23l-9-9 9.59-9.59A2 2 0 0 1 13 4h7v7a2 2 0 0 1-.41 1.41z" />
    <circle cx="16.5" cy="7.5" r="1.5" />
  </svg>
);

const LINK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CALCULATOR_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="8" y2="10" />
    <line x1="12" y1="10" x2="12" y2="10" />
    <line x1="16" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="8" y2="14" />
    <line x1="12" y1="14" x2="12" y2="14" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <line x1="8" y1="18" x2="8" y2="18" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

const FILE_TEXT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

const CLIPBOARD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </svg>
);

const REPEAT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const RECEIPT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="12" y2="16" />
  </svg>
);

const CARD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const KEY_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

function BrandMark() {
  return (
    <div className="app-sidebar-brand">
      <BrightloopLogo variant="full" size={30} />
    </div>
  );
}

type NavGroup = { label: string; items: NavItem[] };

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

  const adminGroup: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: DASHBOARD_ICON },
    ...(role === "ADMIN" ? [{ href: "/admin/staff", label: "Staff", icon: STAFF_ICON }] : []),
  ];

  const catalogueGroup: NavItem[] =
    role === "ADMIN"
      ? [
          { href: "/admin/products", label: "Products", icon: BOX_ICON },
          { href: "/admin/variants", label: "Variants", icon: LAYERS_ICON },
          { href: "/admin/plans", label: "Plans", icon: CALENDAR_ICON },
          { href: "/admin/taxes", label: "Taxes", icon: PERCENT_ICON },
          { href: "/admin/discounts", label: "Discounts", icon: TAG_ICON },
          { href: "/admin/staff-assignments", label: "Staff Assignments", icon: LINK_ICON },
          { href: "/admin/pricing-preview", label: "Pricing Preview", icon: CALCULATOR_ICON },
        ]
      : [
          { href: "/admin/my-products", label: "My Products", icon: BOX_ICON },
          { href: "/admin/pricing-preview", label: "Pricing Preview", icon: CALCULATOR_ICON },
        ];

  const commercialGroup: NavItem[] = [
    ...(role === "ADMIN" ? [{ href: "/admin/quotation-templates", label: "Quotation Templates", icon: FILE_TEXT_ICON }] : []),
    { href: "/admin/quotations", label: "Quotations", icon: CLIPBOARD_ICON },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: REPEAT_ICON },
  ];

  const billingGroup: NavItem[] = [
    { href: "/admin/invoices", label: "Invoices", icon: RECEIPT_ICON },
    { href: "/admin/payments", label: "Payments", icon: CARD_ICON },
    { href: "/admin/software-access", label: "Software Access", icon: KEY_ICON },
  ];

  const navGroups: NavGroup[] = [
    { label: role === "ADMIN" ? "Admin" : "Staff", items: adminGroup },
    { label: "Catalogue", items: catalogueGroup },
    { label: "Commercial", items: commercialGroup },
    { label: "Billing", items: billingGroup },
  ];

  const allItems = navGroups.flatMap((g) => g.items);
  const pageTitle = allItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandMark />
        <nav className="app-sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label}>
              <span className="app-nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`app-nav-item${pathname.startsWith(item.href) ? " active" : ""}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
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
