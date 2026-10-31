"use client";

import { useState } from "react";
import { formatMoney, formatDate, STATUS_CLASS } from "@/lib/utils";
import { Search, Layers, ChevronRight } from "lucide-react";
import type { PortalSubscription } from "./types";

type Props = {
  subscriptions: PortalSubscription[];
  onViewSubscription: (sub: PortalSubscription) => void;
  onRefresh: () => void;
};

export function PortalSubscriptions({ subscriptions, onViewSubscription }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = subscriptions.filter((s) => {
    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
    const matchesSearch =
      search === "" ||
      s.number.toLowerCase().includes(search.toLowerCase()) ||
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.planName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Controls Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, maxWidth: 360 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by subscription # or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 36, minHeight: 38, fontSize: "var(--text-xs)" }}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "ACTIVE", "PAUSED", "CLOSED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                border: filterStatus === status ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                background: filterStatus === status ? "color-mix(in srgb, var(--accent) 12%, var(--panel))" : "var(--panel)",
                color: filterStatus === status ? "var(--text)" : "var(--text-muted)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions List */}
      {filtered.length === 0 ? (
        <div
          className="panel"
          style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}
        >
          <Layers size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", margin: 0 }}>
            No subscriptions matching your filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((sub) => {
            const statusBadge = STATUS_CLASS[sub.status] ?? "badge-draft";

            return (
              <div
                key={sub.id}
                className="panel"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "transform var(--transition-fast), border-color var(--transition-fast)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        {sub.number}
                      </span>
                      <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "2px 0 0" }}>
                        {sub.productName}
                      </h3>
                    </div>
                    <span className={`badge ${statusBadge}`}>
                      [{sub.status}]
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    <span className="chip" style={{ fontSize: "0.6875rem" }}>
                      {sub.productCategory}
                    </span>
                    <span className="chip" style={{ fontSize: "0.6875rem" }}>
                      {sub.planBillingPeriod}
                    </span>
                    {sub.lines?.[0]?.variantName && (
                      <span className="chip" style={{ fontSize: "0.6875rem" }}>
                        Variant: {sub.lines[0].variantName}
                      </span>
                    )}
                  </div>

                  {/* Plan Price & Details */}
                  <div
                    style={{
                      background: "var(--table-header)",
                      borderRadius: "var(--radius)",
                      padding: "10px 12px",
                      fontSize: "var(--text-xs)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span className="label" style={{ marginBottom: 2 }}>Plan rate</span>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>
                        {formatMoney(sub.planPrice)}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}> / {sub.planBillingPeriod.toLowerCase()}</span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className="label" style={{ marginBottom: 2 }}>Next renewal</span>
                      <span className="font-mono" style={{ fontWeight: 600 }}>
                        {formatDate(sub.nextBillingDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--hairline)",
                    paddingTop: 12,
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Started: {formatDate(sub.startDate)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewSubscription(sub)}
                    className="btn-ghost"
                    style={{ padding: "0 12px", minHeight: 32, fontSize: "var(--text-xs)", gap: 4 }}
                  >
                    Manage & Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
