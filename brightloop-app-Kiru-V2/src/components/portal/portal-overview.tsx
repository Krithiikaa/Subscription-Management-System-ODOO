"use client";

import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import {
  CreditCard,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import type { PortalDashboardData, PortalSubscription, PortalInvoice } from "./types";

type Props = {
  data: PortalDashboardData;
  onSelectTab: (tab: "overview" | "subscriptions" | "invoices" | "payments" | "profile") => void;
  onViewSubscription: (sub: PortalSubscription) => void;
  onViewInvoice: (inv: PortalInvoice) => void;
  onPayInvoice: (inv: PortalInvoice) => void;
  onSeedDemo: () => void;
  seeding: boolean;
};

export function PortalOverview({
  data,
  onSelectTab,
  onViewSubscription,
  onViewInvoice,
  onPayInvoice,
  onSeedDemo,
  seeding,
}: Props) {
  const { metrics, subscriptions = [], invoices = [], customer } = data;
  const outstandingNum = parseFloat(metrics.totalOutstanding || "0");
  const overdueCount = metrics.overdueCount || 0;

  // Active subscriptions preview (top 3)
  const activeSubs = subscriptions.filter((s: PortalSubscription) => s.status === "ACTIVE").slice(0, 3);

  // Unpaid invoices (if any) or recent 3
  const pendingInvoices = invoices.filter((i: PortalInvoice) => parseFloat(i.balanceDue) > 0.01);
  const recentInvoices = invoices.slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Zero Subscriptions Welcome Banner */}
      {subscriptions.length === 0 && (
        <div
          className="panel"
          style={{
            padding: "24px",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--panel)), var(--panel))",
            border: "1px solid var(--accent)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius)",
                background: "var(--accent)",
                color: "var(--accent-contrast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 6px" }}>
                Welcome to your Brightloop Customer Portal, {customer.name}!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0, maxWidth: 680 }}>
                This is your self-service billing and subscription command center. You can track active licenses,
                settle recurring invoices via UPI or Card, download tax receipts, and manage your billing settings.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={onSeedDemo}
              disabled={seeding}
              className="btn-primary"
              style={{ gap: 8 }}
            >
              <Sparkles size={16} />
              {seeding ? "Generating Demo Accounts..." : "Load Sample Subscriptions & Invoices"}
            </button>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              One-click demo data for hackathon evaluation
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {/* Card 1: Active Plans */}
        <div className="panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="label" style={{ margin: 0 }}>Active Subscriptions</span>
            <Layers size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {metrics.activeSubsCount}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
            {metrics.pausedSubsCount > 0 ? `${metrics.pausedSubsCount} paused • ` : ""}
            {metrics.totalSubsCount} total historical contracts
          </div>
        </div>

        {/* Card 2: Next Billing */}
        <div className="panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="label" style={{ margin: 0 }}>Next Scheduled Renewal</span>
            <Calendar size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {metrics.nextBillingDate ? formatDate(metrics.nextBillingDate) : "—"}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
            Estimated cycle renewal:{" "}
            <strong style={{ color: "var(--text)" }}>{formatMoney(metrics.estimatedNextBillingAmount)}</strong>
          </div>
        </div>

        {/* Card 3: Outstanding Due */}
        <div
          className="panel"
          style={{
            padding: "20px",
            border: outstandingNum > 0.01 ? "1px solid var(--danger)" : "1px solid var(--hairline)",
            background:
              outstandingNum > 0.01
                ? "color-mix(in srgb, var(--danger) 4%, var(--panel))"
                : "var(--panel)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="label" style={{ margin: 0 }}>Outstanding Balance</span>
            {outstandingNum > 0.01 ? (
              <AlertCircle size={18} color="var(--danger)" />
            ) : (
              <CheckCircle2 size={18} color="var(--success)" />
            )}
          </div>
          <div
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: outstandingNum > 0.01 ? "var(--danger)" : "var(--success)",
            }}
          >
            {formatMoney(metrics.totalOutstanding)}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
            {overdueCount > 0 ? (
              <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                ⚠️ {overdueCount} invoice is past due!
              </span>
            ) : outstandingNum > 0.01 ? (
              <span>Due on invoice confirmation</span>
            ) : (
              <span style={{ color: "var(--success)" }}>✓ All accounts in good standing</span>
            )}
          </div>
        </div>

        {/* Card 4: Total Settled */}
        <div className="panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="label" style={{ margin: 0 }}>Total Paid to Date</span>
            <ShieldCheck size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
            {formatMoney(metrics.totalPaid)}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
            Lifetime invoiced: {formatMoney(metrics.totalInvoiced)}
          </div>
        </div>
      </div>

      {/* Unpaid Invoices Alert Banner (if any) */}
      {pendingInvoices.length > 0 && (
        <div
          className="panel"
          style={{
            padding: "16px 20px",
            borderLeft: "4px solid var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            background: "color-mix(in srgb, var(--danger) 5%, var(--panel))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CreditCard size={22} color="var(--danger)" />
            <div>
              <p style={{ fontWeight: 600, margin: 0, fontSize: "var(--text-sm)" }}>
                You have {pendingInvoices.length} unpaid invoice awaiting settlement (
                {formatMoney(metrics.totalOutstanding)})
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: "2px 0 0" }}>
                Pay via UPI, Credit/Debit card or NEFT transfer to maintain uninterrupted service.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPayInvoice(pendingInvoices[0])}
            className="btn-primary"
            style={{ padding: "0 16px", minHeight: 38 }}
          >
            Pay {pendingInvoices[0].number} Now
          </button>
        </div>
      )}

      {/* Dual Column: Subscriptions & Invoices Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Left: Active Subscriptions */}
        <div className="panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
              Active Subscriptions
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab("subscriptions")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              View all ({subscriptions.length}) <ChevronRight size={14} />
            </button>
          </div>

          {activeSubs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", padding: "16px 0" }}>
              No active subscriptions found.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeSubs.map((sub: PortalSubscription) => (
                <div
                  key={sub.id}
                  onClick={() => onViewSubscription(sub)}
                  style={{
                    padding: 14,
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--hairline)",
                    background: "var(--table-header)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color var(--transition-fast)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        {sub.number}
                      </span>
                      <span className="badge badge-active">[ACTIVE]</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginTop: 4 }}>
                      {sub.productName}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {sub.planName} • {formatMoney(sub.planPrice)} / {sub.planBillingPeriod.toLowerCase()}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="label" style={{ marginBottom: 2 }}>Next renewal</div>
                    <div className="font-mono" style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>
                      {formatDate(sub.nextBillingDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Invoices */}
        <div className="panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="font-serif" style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
              Recent Invoices
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab("invoices")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              All Invoices ({invoices.length}) <ChevronRight size={14} />
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", padding: "16px 0" }}>
              No billing invoices generated yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentInvoices.map((inv: PortalInvoice) => {
                const balanceDue = parseFloat(inv.balanceDue);

                return (
                  <div
                    key={inv.id}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--hairline)",
                      background: "var(--panel)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          onClick={() => onViewInvoice(inv)}
                          className="font-mono"
                          style={{
                            fontWeight: 600,
                            fontSize: "var(--text-xs)",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {inv.number}
                        </span>
                        <span className={`badge ${inv.isOverdue ? "badge-overdue" : STATUS_CLASS[inv.status]}`}>
                          {inv.isOverdue ? "[OVERDUE]" : `[${inv.status}]`}
                        </span>
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                        Due {formatDate(inv.dueDate)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ textAlign: "right" }}>
                        <div className="font-mono" style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
                          {formatMoney(inv.total)}
                        </div>
                        {balanceDue > 0.01 && (
                          <div style={{ fontSize: "0.7rem", color: "var(--danger)" }}>
                            Due: {formatMoney(balanceDue)}
                          </div>
                        )}
                      </div>

                      {balanceDue > 0.01 ? (
                        <button
                          type="button"
                          onClick={() => onPayInvoice(inv)}
                          className="btn-primary"
                          style={{ padding: "0 10px", minHeight: 30, fontSize: "0.75rem" }}
                        >
                          Pay
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="btn-ghost"
                          style={{ padding: "0 10px", minHeight: 30, fontSize: "0.75rem" }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
