"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength, validatePasswordRules } from "@/components/shared/password-strength";
import { CheckCircle2, User, Lock } from "lucide-react";

export default function CustomerProfilePage() {
  const [profile, setProfile] = React.useState<any>({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
  });

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [pwdMsg, setPwdMsg] = React.useState("");
  const [profileMsg, setProfileMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            companyName: data.user.customer?.companyName || "",
            phone: data.user.customer?.phone || "",
            address: data.user.customer?.address || "",
            city: data.user.customer?.city || "",
            state: data.user.customer?.state || "",
            pincode: data.user.customer?.pincode || "",
            gstin: data.user.customer?.gstin || "",
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg("");

    const rules = validatePasswordRules(newPassword);
    if (!rules.length || !rules.hasUpper || !rules.hasLower || !rules.hasSpecial) {
      setPwdMsg("New password does not meet required complexity standards");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");
      setPwdMsg("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwdMsg(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          My Profile & Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review business registration details, billing contact, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>Your registered details used on tax invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Contact Name</label>
              <Input value={profile.name} readOnly className="bg-slate-50 dark:bg-slate-950 cursor-default" />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Email Address</label>
              <Input value={profile.email} readOnly className="bg-slate-50 dark:bg-slate-950 cursor-default" />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium">Company Name</label>
              <Input value={profile.companyName || "—"} readOnly className="bg-slate-50 dark:bg-slate-950 cursor-default" />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium">GSTIN</label>
              <Input value={profile.gstin || "—"} readOnly className="bg-slate-50 dark:bg-slate-950 cursor-default font-mono" />
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Update your login credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            {pwdMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs ${
                  pwdMsg.includes("successfully")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {pwdMsg}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="•••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordStrength password={newPassword} />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-medium" isLoading={loading}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

