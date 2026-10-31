// Central server-side subscription lifecycle transition rules.
//
// The schema's subscription_status enum (DRAFT, QUOTATION, CONFIRMED, ACTIVE,
// PAUSED, CLOSED) has no CANCELLED value — a cancelled DRAFT/QUOTATION
// subscription transitions straight to CLOSED (the one terminal state),
// documented here rather than adding a new enum value for a rarely-used path.
//
// Pause/resume/close/renew permission is governed by the plans attached to
// the subscription's lines. A subscription can have multiple lines with
// different plans; the conservative rule applied here is that an operation
// is permitted only if EVERY line's plan permits it — pausing part of a
// subscription while another part keeps billing is not supported.

export type SubscriptionStatus = "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";

import { eq } from "drizzle-orm";
import type { Db, Tx } from "@/db";
import { plans, subscriptionLines } from "@/db/schema";

// Subscriptions converted from an accepted Quotation are created directly at
// CONFIRMED (the customer's agreement was already recorded on the quotation).
// DRAFT/QUOTATION only apply to the secondary admin/staff direct-creation
// path; /confirm accepts either as a valid pre-confirmation state since there
// is no separate "mark as quotation" endpoint in this phase's API surface.
const TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  DRAFT: ["QUOTATION", "CONFIRMED", "CLOSED"],
  QUOTATION: ["CONFIRMED", "CLOSED"],
  CONFIRMED: ["ACTIVE", "CLOSED"],
  ACTIVE: ["PAUSED", "CLOSED"],
  PAUSED: ["ACTIVE", "CLOSED"],
  CLOSED: [],
};

export function isValidTransition(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export type PlanPermissions = { closable: boolean; pausable: boolean; renewable: boolean };

// All-lines-must-permit rule — see module doc comment above.
export function planPermissionsAllow(planList: PlanPermissions[], permission: keyof PlanPermissions): boolean {
  if (planList.length === 0) return false;
  return planList.every((p) => p[permission]);
}

export async function loadPlanPermissionsForSubscription(tx: Db | Tx, subscriptionId: number): Promise<PlanPermissions[]> {
  const lines = await tx
    .select({ closable: plans.closable, pausable: plans.pausable, renewable: plans.renewable })
    .from(subscriptionLines)
    .innerJoin(plans, eq(plans.id, subscriptionLines.planId))
    .where(eq(subscriptionLines.subscriptionId, subscriptionId));
  return lines;
}
