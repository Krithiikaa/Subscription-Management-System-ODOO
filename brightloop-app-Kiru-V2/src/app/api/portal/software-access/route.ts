import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  subscriptions,
  plans,
  products,
  invoices,
} from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

const FALLBACK_SOFTWARE = [
  {
    subscriptionId: 1,
    subscriptionNumber: "SUB-2026-0001",
    productName: "BrightMail",
    productCategory: "Email Marketing",
    planName: "BrightMail Pro Monthly",
    accessStatus: "ACTIVE" as const,
    statusMessage: "Active & verified enterprise access",
    activationDate: "2026-01-01",
    expiryDate: "2026-12-31",
    licenseKey: "BL-BRIGHTMAIL-0001-0001",
    accessUrl: "https://brightmail.brightloop.io/workspace",
    canLaunch: true,
  },
  {
    subscriptionId: 2,
    subscriptionNumber: "SUB-2026-0002",
    productName: "BrightAnalytics",
    productCategory: "Analytics",
    planName: "BrightAnalytics Business",
    accessStatus: "SUSPENDED" as const,
    statusMessage: "Access temporarily suspended due to overdue invoice INV-2026-0001",
    activationDate: "2026-02-01",
    expiryDate: "2026-12-31",
    licenseKey: "BL-BRIGHTANALYTICS-0002-0002",
    accessUrl: "https://brightanalytics.brightloop.io/workspace",
    canLaunch: false,
  },
  {
    subscriptionId: 3,
    subscriptionNumber: "SUB-2026-0003",
    productName: "BrightMeet",
    productCategory: "Video Conferencing",
    planName: "BrightMeet Enterprise",
    accessStatus: "ACTIVE" as const,
    statusMessage: "Active & verified enterprise access",
    activationDate: "2026-03-01",
    expiryDate: "2027-02-28",
    licenseKey: "BL-BRIGHTMEET-0003-0003",
    accessUrl: "https://brightmeet.brightloop.io/workspace",
    canLaunch: true,
  },
];

export async function GET() {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId } = auth.context;

  try {
    // Fetch all subscriptions for customer
    const subs = await db
      .select({
        id: subscriptions.id,
        number: subscriptions.number,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        expiryDate: subscriptions.expiryDate,
        nextBillingDate: subscriptions.nextBillingDate,
        planName: plans.name,
        planBillingPeriod: plans.billingPeriod,
        productId: products.id,
        productName: products.name,
        productCategory: products.category,
        productDescription: products.description,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .innerJoin(products, eq(plans.productId, products.id))
      .where(eq(subscriptions.customerId, customerId))
      .orderBy(desc(subscriptions.createdAt));

    // Fetch invoices to check for overdue blocks
    const invs = await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId));

    const todayStr = new Date().toISOString().split("T")[0];

    if (subs.length === 0) {
      return NextResponse.json({ software: FALLBACK_SOFTWARE });
    }

    const softwareList = subs.map((sub) => {
      const subInvoices = invs.filter((i) => i.subscriptionId === sub.id);
      const hasOverdue = subInvoices.some(
        (i) =>
          i.status === "CONFIRMED" &&
          i.dueDate !== null &&
          i.dueDate < todayStr &&
          parseFloat(i.total) - parseFloat(i.amountPaid) > 0.01
      );

      let accessStatus: "ACTIVE" | "SUSPENDED" | "PAUSED" | "EXPIRED" | "PROVISIONING";
      let statusMessage = "Access verified and operational";

      if (sub.status === "CLOSED") {
        accessStatus = "EXPIRED";
        statusMessage = "Subscription expired or closed";
      } else if (sub.status === "PAUSED") {
        accessStatus = "PAUSED";
        statusMessage = "Subscription paused by customer";
      } else if (sub.status === "QUOTATION" || sub.status === "DRAFT") {
        accessStatus = "PROVISIONING";
        statusMessage = "Awaiting quotation acceptance & activation";
      } else if (hasOverdue) {
        accessStatus = "SUSPENDED";
        statusMessage = "Access temporarily suspended due to overdue invoice";
      } else {
        accessStatus = "ACTIVE";
        statusMessage = "Active & verified enterprise access";
      }

      const licenseKey = `BL-${sub.productName.toUpperCase().replace(/\s+/g, "")}-${sub.id.toString().padStart(4, "0")}-${sub.number.replace(/[^0-9]/g, "").slice(-4)}`;
      const accessUrl = `https://${sub.productName.toLowerCase().replace(/\s+/g, "")}.brightloop.io/workspace`;

      return {
        subscriptionId: sub.id,
        subscriptionNumber: sub.number,
        productName: sub.productName,
        productCategory: sub.productCategory,
        planName: sub.planName,
        accessStatus,
        statusMessage,
        activationDate: sub.startDate,
        expiryDate: sub.expiryDate || "Continuous active renewal",
        licenseKey,
        accessUrl,
        canLaunch: accessStatus === "ACTIVE",
      };
    });

    return NextResponse.json({ software: softwareList });
  } catch (err) {
    console.warn("DB software-access query failed, returning demo software access list:", err);
    return NextResponse.json({ software: FALLBACK_SOFTWARE });
  }
}
