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
          <p style={{ fontSize: "var(--text-sm)" }}>Loading your customer workspace...</p>
        </div>
      </main>
    );
  }

  const { customer, metrics, subscriptions, invoices, payments } = data;
  const unpaidCount = invoices.filter((i: PortalInvoice) => parseFloat(i.balanceDue) > 0.01).length;
  const pendingQuotationsCount = subscriptions.filter((s) => s.status === "QUOTATION").length;

  const NAV_ITEMS: Array<{
    id: PortalTabId;
    label: string;
    icon: LucideIcon;
    badge?: number;
    badgeDanger?: boolean;
  }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "catalogue", label: "Explore Software", icon: Compass },
    {
      id: "quotations",
      label: "My Quotations",
      icon: FileSpreadsheet,
      badge: pendingQuotationsCount > 0 ? pendingQuotationsCount : undefined,
    },
    {
      id: "subscriptions",
      label: "My Subscriptions",
      icon: Layers,
      badge: subscriptions.length > 0 ? subscriptions.length : undefined,
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
      badgeDanger: unpaidCount > 0,
    },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "access", label: "Software Access", icon: Rocket },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "My Profile", icon: User },
    { id: "support", label: "Support", icon: Headphones },
  ];

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--hairline)",
          background: "var(--panel)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BrightloopLogo variant="compact" size={28} />
            <div
              style={{
                height: 18,
                width: 1,
                background: "var(--hairline)",
                display: "inline-block",
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Customer Workspace
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text)", marginLeft: 8, fontWeight: 600 }}>
                • {customer.companyName || customer.name}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {subscriptions.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDemo}
                disabled={seeding}
                className="btn-ghost"
                style={{
                  minHeight: 34,
                  padding: "0 10px",
                  fontSize: "var(--text-xs)",
                  color: "var(--accent)",
                  borderColor: "var(--accent)",
                }}
              >
                <Sparkles size={14} />
                {seeding ? "Seeding..." : "Load Demo Data"}
              </button>
            )}

            <button
              type="button"
              onClick={fetchDashboard}
              disabled={refreshing}
              className="icon-btn"
              style={{ width: 34, height: 34 }}
              title="Refresh Dashboard"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>

            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            gap: 4,
            overflowX: "auto",
          }}
        >
          {NAV_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 12px",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={14} color={isActive ? "var(--accent)" : "currentColor"} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    style={{
                      padding: "1px 5px",
                      borderRadius: 999,
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      background: tab.badgeDanger ? "var(--danger)" : "var(--table-header)",
                      color: tab.badgeDanger ? "#FFFFFF" : "var(--text-muted)",
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          padding: "24px 20px 48px",
          flex: 1,
        }}
      >
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

      {/* Payment Modal */}
      {payingInvoice && (
        <PortalPaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={async () => {
            await fetchDashboard();
          }}
        />
      )}

      {/* Invoice Drawer */}
      <PortalInvoiceDrawer
        invoice={selectedInvoice}
        customer={customer}
        onClose={() => setSelectedInvoice(null)}
        onPayNow={(inv: PortalInvoice) => {
          setSelectedInvoice(null);
          setPayingInvoice(inv);
        }}
      />

      {/* Subscription Drawer */}
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
