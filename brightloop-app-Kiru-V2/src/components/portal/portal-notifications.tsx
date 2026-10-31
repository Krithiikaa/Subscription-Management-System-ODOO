"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  AlertCircle,
  FileText,
  CreditCard,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { PortalNotification } from "./types";

type Props = {
  onNavigateTab: (tab: "overview" | "subscriptions" | "invoices" | "payments" | "quotations" | "access") => void;
};

export function PortalNotifications({ onNavigateTab }: Props) {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    async function fetchNotifs() {
      try {
        setLoading(true);
        const res = await fetch("/api/portal/notifications");
        if (res.ok) {
          const json = await res.json();
          setNotifications(json.notifications || []);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, []);

  const filtered = notifications.filter(
    (n) => filterType === "ALL" || n.type === filterType
  );

  function getIcon(type: string, priority: string) {
    if (priority === "HIGH") return <AlertCircle size={18} color="var(--danger)" />;
    if (type === "PAYMENT") return <CreditCard size={18} color="var(--success)" />;
    if (type === "QUOTATION") return <Sparkles size={18} color="var(--accent)" />;
    if (type === "INVOICE") return <FileText size={18} color="#2563EB" />;
    return <Layers size={18} color="var(--text-muted)" />;
  }

  function handleActionClick(type: string) {
    if (type === "INVOICE") onNavigateTab("invoices");
    else if (type === "QUOTATION") onNavigateTab("quotations");
    else if (type === "PAYMENT") onNavigateTab("payments");
    else if (type === "SUBSCRIPTION") onNavigateTab("subscriptions");
    else onNavigateTab("overview");
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: "var(--text-sm)" }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        className="panel"
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 4px" }}>
            Notifications & System Alerts
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
            Real-time activity log for subscription lifecycles, billing generation, payment confirmations, and security notices.
          </p>
        </div>

        {/* Filter tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["ALL", "INVOICE", "QUOTATION", "SUBSCRIPTION", "PAYMENT"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                border: filterType === t ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                background: filterType === t ? "color-mix(in srgb, var(--accent) 12%, var(--panel))" : "var(--panel)",
                color: filterType === t ? "var(--text)" : "var(--text-muted)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <Bell size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
            All Caught Up!
          </h3>
          <p style={{ fontSize: "var(--text-xs)", margin: 0 }}>
            No unread alerts matching your filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className="panel"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                borderLeft:
                  n.priority === "HIGH"
                    ? "4px solid var(--danger)"
                    : n.priority === "MEDIUM"
                    ? "4px solid var(--warning)"
                    : "1px solid var(--hairline)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ marginTop: 2 }}>{getIcon(n.type, n.priority)}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 700, margin: 0 }}>
                      {n.title}
                    </h4>
                    <span className="chip" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                      {n.type}
                    </span>
                    {n.priority === "HIGH" && (
                      <span className="badge badge-overdue" style={{ fontSize: "0.65rem" }}>
                        ACTION REQUIRED
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4, display: "inline-block" }}>
                    {formatDate(n.date)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleActionClick(n.type)}
                className="btn-ghost"
                style={{ padding: "0 10px", minHeight: 30, fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
