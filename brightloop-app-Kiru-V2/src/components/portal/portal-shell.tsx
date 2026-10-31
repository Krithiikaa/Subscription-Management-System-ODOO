"use client";

import { useState, useEffect, useCallback } from "react";
import { BrightloopLogo } from "@/components/brand/brightloop-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LogoutButton } from "@/components/shared/logout-button";
import { PortalOverview } from "./portal-overview";
import { PortalCatalogue } from "./portal-catalogue";
import { PortalQuotations } from "./portal-quotations";
import { PortalSubscriptions } from "./portal-subscriptions";
import { PortalInvoices } from "./portal-invoices";
import { PortalPayments } from "./portal-payments";
import { PortalSoftwareAccess } from "./portal-software-access";
import { PortalNotifications } from "./portal-notifications";
import { PortalProfile } from "./portal-profile";
import { PortalSupport } from "./portal-support";
import { PortalPaymentModal } from "./portal-payment-modal";
import { PortalInvoiceDrawer } from "./portal-invoice-drawer";
import { PortalSubscriptionDrawer } from "./portal-subscription-drawer";
import type {
  PortalDashboardData,
  PortalSubscription,
  PortalInvoice,
  PortalCustomer,
} from "./types";
import {
  LayoutDashboard,
  Compass,
  FileSpreadsheet,
  Layers,
  FileText,
  CreditCard,
  Rocket,
  Bell,
  User,
  Headphones,
  Sparkles,
  RefreshCw,
  Loader2,
  Menu,
  X,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export type PortalTabId =
  | "dashboard"
  | "catalogue"
  | "quotations"
  | "subscriptions"
  | "invoices"
  | "payments"
  | "access"
  | "notifications"
  | "profile"
  | "support";

type Props = {
  initialData?: PortalDashboardData;
};

export function PortalShell({ initialData }: Props) {
  const [data, setData] = useState<PortalDashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState<PortalTabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Selected drawers / modals
  const [selectedInvoice, setSelectedInvoice] = useState<PortalInvoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<PortalInvoice | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<PortalSubscription | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/portal/dashboard");
      if (res.ok) {
        const json: PortalDashboardData = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchDashboard();
    }
  }, [initialData, fetchDashboard]);

  async function handleSeedDemo() {
    setSeeding(true);
    try {
      const res = await fetch("/api/portal/seed-demo", { method: "POST" });
      if (res.ok) {
        await fetchDashboard();
      } else {
        const err = await res.json();
        alert(err.error || "Seeding failed");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Seeding failed";
      alert(msg);
    } finally {
      setSeeding(false);
    }
  }

  if (loading || !data) {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "var(--text-sm)" }}>Loading your workspace...</p>
        </div>
      </main>
    );
  }

  const { customer, metrics, subscriptions, invoices, payments } = data;
  const unpaidCount = invoices.filter((i: PortalInvoice) => parseFloat(i.balanceDue) > 0.01).length;
  const pendingQuotationsCount = subscriptions.filter((s) => s.status === "QUOTATION").length;
  const notifCount = unpaidCount + pendingQuotationsCount;

  const NAV_ITEMS: Array<{
    id: PortalTabId;
    label: string;
    icon: LucideIcon;
    badge?: number;
    badgeDanger?: boolean;
    section?: string;
  }> = [
    { id: "dashboard",      label: "Dashboard",        icon: LayoutDashboard, section: "MAIN" },
    { id: "catalogue",      label: "Explore Software",  icon: Compass,         section: "MAIN" },
    { id: "quotations",     label: "My Quotations",     icon: FileSpreadsheet, badge: pendingQuotationsCount > 0 ? pendingQuotationsCount : undefined, section: "BILLING" },
    { id: "subscriptions",  label: "My Subscriptions",  icon: Layers,          badge: subscriptions.length > 0 ? subscriptions.length : undefined, section: "BILLING" },
    { id: "invoices",       label: "Invoices",          icon: FileText,        badge: unpaidCount > 0 ? unpaidCount : undefined, badgeDanger: unpaidCount > 0, section: "BILLING" },
    { id: "payments",       label: "Payments",          icon: CreditCard,      section: "BILLING" },
    { id: "access",         label: "Software Access",   icon: Rocket,          section: "ACCESS" },
    { id: "notifications",  label: "Notifications",     icon: Bell,            badge: notifCount > 0 ? notifCount : undefined, section: "ACCESS" },
    { id: "profile",        label: "My Profile",        icon: User,            section: "ACCOUNT" },
    { id: "support",        label: "Support",           icon: Headphones,      section: "ACCOUNT" },
  ];

  const sections = [
    { key: "MAIN",    label: "Overview" },
    { key: "BILLING", label: "Billing" },
    { key: "ACCESS",  label: "My Products" },
    { key: "ACCOUNT", label: "Account" },
  ];

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 64;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: 56,
        borderBottom: "1px solid var(--hairline)",
        background: "var(--panel)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
      }}>
        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="icon-btn"
          style={{ width: 36, height: 36, flexShrink: 0 }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <BrightloopLogo variant="compact" size={26} />

        <div style={{
          height: 18, width: 1,
          background: "var(--hairline)",
          display: "inline-block",
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Customer Portal
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text)", marginLeft: 8, fontWeight: 600 }}>
            • {customer.companyName || customer.name}
          </span>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {subscriptions.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={seeding}
              className="btn-ghost"
              style={{ minHeight: 32, padding: "0 10px", fontSize: "var(--text-xs)", color: "var(--accent)", borderColor: "var(--accent)" }}
            >
              <Sparkles size={13} />
              {seeding ? "Loading..." : "Load Initial Products"}
            </button>
          )}
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={refreshing}
            className="icon-btn"
            style={{ width: 34, height: 34 }}
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* ── Body: Sidebar + Content ────────────────────────────────────── */}
      <div style={{ display: "flex", paddingTop: 56, minHeight: "100dvh" }}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside style={{
          position: "fixed",
          top: 56,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          background: "var(--panel)",
          borderRight: "1px solid var(--hairline)",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 30,
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Customer info mini card */}
          {sidebarOpen && (
            <div style={{
              margin: "16px 12px 8px",
              padding: "12px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--accent) 10%, var(--panel))",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "var(--accent-contrast)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "var(--text-sm)",
                marginBottom: 8,
              }}>
              {(customer.companyName || customer.name || "?").charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text)", lineHeight: 1.3 }}>
                {customer.companyName || customer.name}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                Customer Account
              </div>
            </div>
          )}

          {/* Nav sections */}
          <nav style={{ flex: 1, padding: "8px 0" }}>
            {sections.map((section) => {
              const items = NAV_ITEMS.filter((n) => n.section === section.key);
              return (
                <div key={section.key} style={{ marginBottom: 4 }}>
                  {sidebarOpen && (
                    <div style={{
                      padding: "10px 16px 4px",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {section.label}
                    </div>
                  )}
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        title={!sidebarOpen ? item.label : undefined}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: sidebarOpen ? "9px 16px" : "9px 0",
                          justifyContent: sidebarOpen ? "flex-start" : "center",
                          background: isActive
                            ? "color-mix(in srgb, var(--accent) 12%, var(--panel))"
                            : "transparent",
                          border: "none",
                          borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                          borderRadius: 0,
                          color: isActive ? "var(--accent)" : "var(--text-muted)",
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.8125rem",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <Icon size={16} style={{ flexShrink: 0 }} />
                        {sidebarOpen && (
                          <>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge !== undefined && (
                              <span style={{
                                padding: "1px 6px",
                                borderRadius: 999,
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                background: item.badgeDanger ? "var(--danger)" : "var(--table-header)",
                                color: item.badgeDanger ? "#fff" : "var(--text-muted)",
                                flexShrink: 0,
                              }}>
                                {item.badge}
                              </span>
                            )}
                            {isActive && <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.5 }} />}
                          </>
                        )}
                        {/* Badge dot when collapsed */}
                        {!sidebarOpen && item.badge !== undefined && (
                          <span style={{
                            position: "absolute",
                            top: 7, right: 10,
                            width: 7, height: 7,
                            borderRadius: "50%",
                            background: item.badgeDanger ? "var(--danger)" : "var(--accent)",
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Bottom: version tag */}
          {sidebarOpen && (
            <div style={{
              padding: "12px 16px",
              fontSize: "0.625rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              borderTop: "1px solid var(--hairline)",
            }}>
              Brightloop v2 • Customer Portal
            </div>
          )}
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          marginLeft: SIDEBAR_WIDTH,
          transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 32px 56px",
          minWidth: 0,
          maxWidth: "100%",
        }}>
          {/* Page heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 4px", fontFamily: "var(--font-serif, inherit)" }}>
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <div style={{ height: 2, width: 32, background: "var(--accent)", borderRadius: 2 }} />
          </div>

          {activeTab === "dashboard" && (
            <PortalOverview
              data={data}
              onSelectTab={(t) => {
                if (t === "subscriptions") setActiveTab("subscriptions");
                else if (t === "invoices") setActiveTab("invoices");
                else setActiveTab("dashboard");
              }}
              onViewSubscription={(sub) => setSelectedSubscription(sub)}
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onPayInvoice={(inv) => setPayingInvoice(inv)}
              onSeedDemo={handleSeedDemo}
              seeding={seeding}
            />
          )}

          {activeTab === "catalogue" && (
            <PortalCatalogue
              onRequestQuoteSuccess={() => {
                fetchDashboard();
                setActiveTab("quotations");
              }}
            />
          )}

          {activeTab === "quotations" && (
            <PortalQuotations
              onAcceptSuccess={() => {
                fetchDashboard();
                setActiveTab("subscriptions");
              }}
            />
          )}

          {activeTab === "subscriptions" && (
            <PortalSubscriptions
              subscriptions={subscriptions}
              onViewSubscription={(sub) => setSelectedSubscription(sub)}
              onRefresh={fetchDashboard}
            />
          )}

          {activeTab === "invoices" && (
            <PortalInvoices
              invoices={invoices}
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onPayInvoice={(inv) => setPayingInvoice(inv)}
            />
          )}

          {activeTab === "payments" && (
            <PortalPayments payments={payments} totalPaid={metrics.totalPaid} />
          )}

          {activeTab === "access" && (
            <PortalSoftwareAccess
              onPayOverdue={() => setActiveTab("invoices")}
            />
          )}

          {activeTab === "notifications" && (
            <PortalNotifications
              onNavigateTab={(t) => {
                if (t === "invoices") setActiveTab("invoices");
                else if (t === "quotations") setActiveTab("quotations");
                else if (t === "subscriptions") setActiveTab("subscriptions");
                else if (t === "payments") setActiveTab("payments");
                else if (t === "access") setActiveTab("access");
                else setActiveTab("dashboard");
              }}
            />
          )}

          {activeTab === "profile" && (
            <PortalProfile
              customer={customer}
              onUpdate={(updated: PortalCustomer) =>
                setData((prev: PortalDashboardData | null) =>
                  prev ? { ...prev, customer: updated } : null
                )
              }
            />
          )}

          {activeTab === "support" && (
            <PortalSupport
              subscriptions={subscriptions}
              invoices={invoices}
            />
          )}
        </main>
      </div>

      {/* ── Modals & Drawers ──────────────────────────────────────────── */}
      {payingInvoice && (
        <PortalPaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={async () => {
            await fetchDashboard();
          }}
        />
      )}

      <PortalInvoiceDrawer
        invoice={selectedInvoice}
        customer={customer}
        onClose={() => setSelectedInvoice(null)}
        onPayNow={(inv: PortalInvoice) => {
          setSelectedInvoice(null);
          setPayingInvoice(inv);
        }}
      />

      <PortalSubscriptionDrawer
        subscription={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
        onActionComplete={async () => {
          await fetchDashboard();
        }}
      />
    </div>
  );
}
