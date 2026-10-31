"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Key,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";
import type { PortalSoftwareAccess } from "./types";

type Props = {
  onPayOverdue: () => void;
};

export function PortalSoftwareAccess({ onPayOverdue }: Props) {
  const [software, setSoftware] = useState<PortalSoftwareAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingId, setLaunchingId] = useState<number | null>(null);
  const [launchModal, setLaunchModal] = useState<{
    productName: string;
    launchUrl: string;
    token: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function fetchSoftware() {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/software-access");
      if (res.ok) {
        const json = await res.json();
        setSoftware(json.software || []);
      }
    } catch (err) {
      console.error("Error loading software access:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSoftware();
  }, []);

  async function handleLaunch(subId: number) {
    setLaunchingId(subId);
    try {
      // Backend entitlement verification call
      const res = await fetch(`/api/portal/software-access/${subId}/launch`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Access authorization failed");
      }

      setLaunchModal({
        productName: data.productName,
        launchUrl: data.launchUrl,
        token: data.launchToken,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to launch software";
      alert(msg);
    } finally {
      setLaunchingId(null);
    }
  }

  function copyLicense(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: "var(--text-sm)" }}>Verifying license entitlements and provisioning...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div
        className="panel"
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--panel)), var(--panel))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="label" style={{ marginBottom: 4 }}>Software Entitlements & Provisioning</span>
          <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "0 0 6px" }}>
            My Software Access Workspace
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0, maxWidth: 680 }}>
            Every application launch executes a server-side entitlement check verifying your subscription contract and
            invoice settlement status before authorization tokens are signed.
          </p>
        </div>
      </div>

      {software.length === 0 ? (
        <div className="panel" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <Lock size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
            No Software Provisioned
          </h3>
          <p style={{ fontSize: "var(--text-xs)", margin: 0 }}>
            You do not currently have any active software subscriptions. Browse the software catalogue to subscribe.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {software.map((item) => {
            const isSuspended = item.accessStatus === "SUSPENDED";
            const isActive = item.accessStatus === "ACTIVE";

            let badgeClass = "badge-draft";
            if (isActive) badgeClass = "badge-active";
            if (isSuspended) badgeClass = "badge-overdue";
            if (item.accessStatus === "PAUSED") badgeClass = "badge-paused";

            return (
              <div
                key={item.subscriptionId}
                className="panel"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  border: isSuspended ? "1px solid var(--danger)" : "1px solid var(--hairline)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span className="label" style={{ marginBottom: 2 }}>{item.productCategory}</span>
                      <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
                        {item.productName}
                      </h3>
                    </div>
                    <span className={`badge ${badgeClass}`}>
                      [{item.accessStatus}]
                    </span>
                  </div>

                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: "0 0 12px" }}>
                    Plan: <strong style={{ color: "var(--text)" }}>{item.planName}</strong> • Sub:{" "}
                    <span className="font-mono">{item.subscriptionNumber}</span>
                  </p>

                  {/* Status Banner */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius)",
                      background: isActive
                        ? "color-mix(in srgb, var(--success) 8%, var(--table-header))"
                        : isSuspended
                        ? "color-mix(in srgb, var(--danger) 10%, var(--table-header))"
                        : "var(--table-header)",
                      fontSize: "var(--text-xs)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {isActive ? (
                      <ShieldCheck size={16} color="var(--success)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--danger)" />
                    )}
                    <span style={{ fontWeight: 500 }}>{item.statusMessage}</span>
                  </div>

                  {/* License Key Box */}
                  <div
                    style={{
                      background: "var(--table-header)",
                      borderRadius: "var(--radius)",
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "var(--text-xs)",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Key size={14} color="var(--accent)" />
                      <span className="font-mono" style={{ fontWeight: 600 }}>{item.licenseKey}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyLicense(item.licenseKey)}
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      title="Copy License Key"
                    >
                      {copiedKey === item.licenseKey ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <div>
                      <span>Activated: </span>
                      <strong className="font-mono" style={{ color: "var(--text)" }}>{formatDate(item.activationDate)}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span>Valid until: </span>
                      <strong style={{ color: "var(--text)" }}>{item.expiryDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Launch Button / Resolution */}
                <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 12 }}>
                  {isActive ? (
                    <button
                      type="button"
                      onClick={() => handleLaunch(item.subscriptionId)}
                      disabled={launchingId === item.subscriptionId}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center", gap: 8 }}
                    >
                      {launchingId === item.subscriptionId ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Verifying Entitlement...
                        </>
                      ) : (
                        <>
                          <ExternalLink size={16} /> Launch {item.productName}
                        </>
                      )}
                    </button>
                  ) : isSuspended ? (
                    <button
                      type="button"
                      onClick={onPayOverdue}
                      className="btn-danger"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Settle Overdue Invoice to Restore Access
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="btn-ghost"
                      style={{ width: "100%", justifyContent: "center", opacity: 0.6 }}
                    >
                      Access Unavailable ({item.accessStatus})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulated Launch Modal */}
      {launchModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 100,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 500,
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--success) 15%, transparent)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Sparkles size={28} />
            </div>

            <h2 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 8px" }}>
              Entitlement Verified!
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: "0 0 16px" }}>
              Backend access check for <strong>{launchModal.productName}</strong> completed successfully.
            </p>

            <div
              style={{
                background: "var(--table-header)",
                borderRadius: "var(--radius)",
                padding: "12px",
                textAlign: "left",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                wordBreak: "break-all",
                marginBottom: 20,
              }}
            >
              <span className="label" style={{ marginBottom: 4 }}>Signed Launch Token</span>
              <div style={{ color: "var(--success)" }}>{launchModal.token}</div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setLaunchModal(null)}
                className="btn-ghost"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(launchModal.launchUrl, "_blank");
                  setLaunchModal(null);
                }}
                className="btn-primary"
              >
                Open Workspace Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

