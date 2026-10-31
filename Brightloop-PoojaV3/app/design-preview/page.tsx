"use client";

import * as React from "react";
import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyText } from "@/components/shared/money-text";
import { DateText } from "@/components/shared/date-text";
import { StatCard } from "@/components/shared/stat-card";
import { StepperTimeline } from "@/components/shared/stepper-timeline";
import { PasswordStrength } from "@/components/shared/password-strength";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Receipt,
  Package,
} from "lucide-react";

export default function DesignPreviewPage() {
  const [testPassword, setTestPassword] = React.useState("BrightLoop@2026");

  const statuses = [
    "DRAFT",
    "QUOTATION",
    "CONFIRMED",
    "ACTIVE",
    "PAUSED",
    "CLOSED",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ];

  return (
    <AppShell
      role="ADMIN"
      breadcrumbs={[{ label: "Design System Preview", href: "/design-preview" }]}
    >
      <div className="space-y-10">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 0.5 — Design Tokens & Shared Component Catalog
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-50">
            Design System & Component Preview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Live interactive catalog of typography tokens, colors, status pills, KPI cards, form controls, and timelines. Fully tested in light and dark mode.
          </p>
        </div>

        {/* 1. Status Badges */}
        <Card>
          <CardHeader>
            <CardTitle>1. Universal Status Badges (Section 6 Spec)</CardTitle>
            <CardDescription>
              Soft tinted background + darker text + status indicator dot. Enforced across subscriptions, quotations, and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {statuses.map((st) => (
                <StatusBadge key={st} status={st} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2. KPI Stat Cards */}
        <div>
          <h2 className="text-lg font-bold font-heading mb-4 text-slate-900 dark:text-slate-100">
            2. Dashboard Bento Stat Cards with Sparklines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Subscriptions"
              value="1,248"
              icon={Users}
              trend={{ value: "+8.4%", isPositive: true, label: "vs last month" }}
              sparklineData={[12, 15, 18, 14, 20, 24, 28, 32]}
            />
            <StatCard
              title="Revenue Collected"
              value="₹8,45,200"
              icon={CreditCard}
              trend={{ value: "+14.2%", isPositive: true, label: "current quarter" }}
              sparklineData={[30, 42, 45, 60, 55, 75, 85, 90]}
            />
            <StatCard
              title="Total Outstanding"
              value="₹1,12,450"
              icon={Receipt}
              trend={{ value: "-3.1%", isPositive: true, label: "healthy trend" }}
              sparklineData={[40, 35, 30, 28, 25, 20, 18, 15]}
            />
            <StatCard
              title="Overdue Invoices"
              value="₹34,800"
              icon={AlertCircle}
              trend={{ value: "+5.0%", isPositive: false, label: "needs chasing" }}
              sparklineData={[5, 8, 4, 10, 12, 14, 18, 22]}
            />
          </div>
        </div>

        {/* 3. Typography & Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>3. Typography Scale & Formatting</CardTitle>
              <CardDescription>
                Tabular INR currency, date formatting, and monospaced codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase font-mono">Invoice Number (JetBrains Mono)</p>
                <p className="font-mono text-base font-semibold text-indigo-600 dark:text-indigo-400">
                  INV-00001 &nbsp; / &nbsp; SUB-00042
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase font-mono">Currency Formatting (Intl en-IN)</p>
                <div className="flex gap-4 items-center">
                  <MoneyText amount={2560} className="text-xl font-bold" />
                  <MoneyText amount={145890.5} className="text-xl font-bold" />
                  <MoneyText amount={-500} colored className="text-sm font-semibold" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase font-mono">Dates (en-GB standard format)</p>
                <DateText date={new Date("2026-10-31")} className="font-medium text-slate-700 dark:text-slate-200" />
              </div>
            </CardContent>
          </Card>

          {/* 4. Password Strength Meter */}
          <Card>
            <CardHeader>
              <CardTitle>4. Live Password-Strength Meter</CardTitle>
              <CardDescription>
                Minimum 9 characters, uppercase, lowercase, and special character.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Type a password to test rules..."
              />
              <PasswordStrength password={testPassword} />
            </CardContent>
          </Card>
        </div>

        {/* 5. Stepper Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>5. Vertical Subscription Status Timeline</CardTitle>
            <CardDescription>
              State flow: Draft → Quotation → Confirmed → Active → Closed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StepperTimeline
              currentStatus="ACTIVE"
              history={[
                {
                  toStatus: "DRAFT",
                  createdAt: new Date("2026-10-01"),
                  changedBy: { name: "Sales Rep Pooja" },
                },
                {
                  toStatus: "QUOTATION",
                  createdAt: new Date("2026-10-03"),
                  changedBy: { name: "Sales Rep Pooja" },
                  note: "15-day quotation sent to client",
                },
                {
                  toStatus: "CONFIRMED",
                  createdAt: new Date("2026-10-05"),
                  changedBy: { name: "Admin Pooja" },
                },
                {
                  toStatus: "ACTIVE",
                  createdAt: new Date("2026-10-05"),
                  changedBy: { name: "Admin Pooja" },
                  note: "Billing cycle initialized",
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* 6. Buttons & UI Elements */}
        <Card>
          <CardHeader>
            <CardTitle>6. Buttons & Interactive Controls</CardTitle>
            <CardDescription>
              Design system button styles, micro-interactions, and loading states.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive (Close/Cancel)</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" isLoading>
              Saving Changes
            </Button>
          </CardContent>
        </Card>

        {/* 7. Empty State Component */}
        <EmptyState
          icon={Package}
          title="No products configured yet"
          description="Create your first subscription product with customizable variants to launch plans."
          actionLabel="Create Product"
          onAction={() => alert("Modal/Route Triggered")}
        />
      </div>
    </AppShell>
  );
}

