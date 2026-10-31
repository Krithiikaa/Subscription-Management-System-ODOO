"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, Lock, BellRing } from "lucide-react";
import type { PortalCustomer } from "./types";

type Props = {
  customer: PortalCustomer;
  onUpdate: (updated: PortalCustomer) => void;
};

export function PortalProfile({ customer, onUpdate }: Props) {
  // Profile state
  const [name, setName] = useState(customer.name || "");
  const [companyName, setCompanyName] = useState(customer.companyName || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.address || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Notification Preferences
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [emailRenewals, setEmailRenewals] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companyName,
          phone,
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      onUpdate(data.customer);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not save profile details";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    setPwLoading(true);

    try {
      const res = await fetch("/api/portal/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Password could not be updated";
      setPwError(message);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
      {/* Panel 1: Company & Billing Info */}
      <div className="panel" style={{ padding: "28px" }}>
        <div style={{ marginBottom: 20 }}>
          <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 6px" }}>
            Company & Billing Information
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
            These details appear on your official tax invoices and receipts.
          </p>
        </div>

        {success && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--success) 12%, transparent)",
              color: "var(--success)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Profile and billing details saved successfully!</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--danger) 12%, transparent)",
              color: "var(--danger)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Account Email (Read-only) */}
          <div>
            <label className="label">Registered Login Email</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={customer.email}
                disabled
                className="input"
                style={{ opacity: 0.7, background: "var(--table-header)", cursor: "not-allowed" }}
              />
              <Mail
                size={16}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              />
            </div>
          </div>

          {/* Contact Person Name */}
          <div>
            <label className="label">Authorized Contact Person</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="label">Company / Legal Business Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="e.g. Acme Technologies Private Limited"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">Contact Phone / Mobile</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          {/* Billing Address */}
          <div>
            <label className="label">Official Billing Address (For Tax Invoices)</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
              placeholder="Building, street, city, state, PIN code"
              rows={3}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Billing Information"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Panel 2: Change Password & Security */}
      <div className="panel" style={{ padding: "28px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Lock size={18} color="var(--accent)" />
            <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
              Account Security & Password
            </h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
            Passwords must contain more than 8 characters, with uppercase, lowercase, and special characters.
          </p>
        </div>

        {pwSuccess && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--success) 12%, transparent)",
              color: "var(--success)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Password updated successfully!</span>
          </div>
        )}

        {pwError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: "color-mix(in srgb, var(--danger) 12%, transparent)",
              color: "var(--danger)",
              fontSize: "var(--text-xs)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Min. 9 characters"
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button type="submit" className="btn-ghost" disabled={pwLoading}>
              {pwLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Panel 3: Notification Preferences */}
      <div className="panel" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BellRing size={18} color="var(--accent)" />
          <h3 className="font-serif" style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
            Notification Preferences
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: "var(--text-xs)" }}>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Billing & Invoice Receipts</div>
              <div style={{ color: "var(--text-muted)" }}>Receive emails when new monthly statements are generated.</div>
            </div>
            <input
              type="checkbox"
              checked={emailInvoices}
              onChange={(e) => setEmailInvoices(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
          </label>

          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Subscription Renewal Notices</div>
              <div style={{ color: "var(--text-muted)" }}>Get notified 7 days prior to scheduled automated renewals.</div>
            </div>
            <input
              type="checkbox"
              checked={emailRenewals}
              onChange={(e) => setEmailRenewals(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
          </label>

          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Security & Entitlement Alerts</div>
              <div style={{ color: "var(--text-muted)" }}>Alerts on password changes, new logins, or access suspensions.</div>
            </div>
            <input
              type="checkbox"
              checked={emailSecurity}
              onChange={(e) => setEmailSecurity(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
