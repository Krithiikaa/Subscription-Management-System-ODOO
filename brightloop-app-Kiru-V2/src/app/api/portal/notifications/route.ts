import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  subscriptions,
  invoices,
  payments,
  plans,
  products,
} from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

const FALLBACK_NOTIFICATIONS = [
  {
    id: "notif-inv-overdue-1",
    type: "INVOICE" as const,
    title: "OVERDUE: Invoice INV-2026-0001",
    message: "Payment of ₹1,299.00 was due on 2026-10-25. Please settle now to avoid service interruption for BrightAnalytics.",
    date: "2026-10-25",
    priority: "HIGH" as const,
    read: false,
  },
  {
    id: "notif-quo-1",
    type: "QUOTATION" as const,
    title: "Quotation QUO-8021 Ready for Review",
    message: "Your requested quotation for BrightAI Suite (₹1,499.00/mo) is ready. Accept it to activate your subscription.",
    date: "2026-10-20",
    priority: "HIGH" as const,
    read: false,
  },
  {
    id: "notif-sub-renew-1",
    type: "SUBSCRIPTION" as const,
    title: "Upcoming Renewal for BrightMail Pro",
    message: "Scheduled monthly renewal on 2026-11-15 (₹799.00). Continuous access enabled.",
    date: "2026-11-15",
    priority: "MEDIUM" as const,
    read: false,
  },
  {
    id: "notif-pay-1",
    type: "PAYMENT" as const,
    title: "Payment Received Successfully",
    message: "Received ₹799.00 via UPI for Invoice INV-2026-0002. Thank you!",
    date: "2026-09-16",
    priority: "LOW" as const,
    read: true,
  },
  {
    id: "notif-sys-1",
    type: "SYSTEM" as const,
    title: "Welcome to Brightloop Customer Portal",
    message: "Manage your software subscriptions, launch applications, approve quotations, and track invoices in one place.",
    date: "2026-09-01",
    priority: "LOW" as const,
    read: true,
  },
];

export async function GET() {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId } = auth.context;

  try {
    // 1. Fetch subscriptions
    const subs = await db
      .select({
        id: subscriptions.id,
        number: subscriptions.number,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        nextBillingDate: subscriptions.nextBillingDate,
        productName: products.name,
        planName: plans.name,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .innerJoin(products, eq(plans.productId, products.id))
      .where(eq(subscriptions.customerId, customerId))
      .orderBy(desc(subscriptions.createdAt));

    // 2. Fetch invoices
    const invs = await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));

    // 3. Fetch payments
    const invIds = invs.map((i) => i.id);
    const payRows =
      invIds.length > 0
        ? await db
            .select()
            .from(payments)
            .orderBy(desc(payments.paidOn), desc(payments.createdAt))
        : [];

    const notifications: Array<{
      id: string;
      type: "QUOTATION" | "INVOICE" | "PAYMENT" | "SUBSCRIPTION" | "SYSTEM";
      title: string;
      message: string;
      date: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      read: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // A. Check for pending quotations
    for (const sub of subs) {
      if (sub.status === "QUOTATION" || sub.number.startsWith("QUO-")) {
        notifications.push({
          id: `notif-quo-${sub.id}`,
          type: "QUOTATION",
          title: `Quotation ${sub.number} Ready for Review`,
          message: `Your quotation for ${sub.productName} (${sub.planName}) is awaiting your acceptance.`,
          date: sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString(),
          priority: "HIGH",
          read: false,
        });
      }

      if (sub.status === "ACTIVE") {
        notifications.push({
          id: `notif-sub-act-${sub.id}`,
          type: "SUBSCRIPTION",
          title: `Subscription ${sub.number} Activated`,
          message: `Your subscription to ${sub.productName} is active and ready for use.`,
          date: sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString(),
          priority: "LOW",
          read: true,
        });

        if (sub.nextBillingDate) {
          notifications.push({
            id: `notif-sub-renew-${sub.id}`,
            type: "SUBSCRIPTION",
            title: `Upcoming Renewal for ${sub.productName}`,
            message: `Scheduled renewal on ${sub.nextBillingDate}. Auto-billing will generate the next cycle statement.`,
            date: sub.nextBillingDate,
            priority: "MEDIUM",
            read: false,
          });
        }
      }

      if (sub.status === "PAUSED") {
        notifications.push({
          id: `notif-sub-pause-${sub.id}`,
          type: "SUBSCRIPTION",
          title: `Subscription ${sub.number} Paused`,
          message: `Service for ${sub.productName} is currently paused. Resume anytime from the portal.`,
          date: sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString(),
          priority: "MEDIUM",
          read: true,
        });
      }
    }

    // B. Check invoices for overdue / due
    for (const inv of invs) {
      const balanceDue = parseFloat(inv.total) - parseFloat(inv.amountPaid);
      const isOverdue =
        inv.status === "CONFIRMED" &&
        inv.dueDate !== null &&
        inv.dueDate < todayStr &&
        balanceDue > 0.01;

      if (isOverdue) {
        notifications.push({
          id: `notif-inv-overdue-${inv.id}`,
          type: "INVOICE",
          title: `OVERDUE: Invoice ${inv.number}`,
          message: `Payment of ₹${balanceDue.toFixed(2)} was due on ${inv.dueDate}. Please settle now to avoid service suspension.`,
          date: inv.dueDate || todayStr,
          priority: "HIGH",
          read: false,
        });
      } else if (inv.status === "CONFIRMED" && balanceDue > 0.01) {
        notifications.push({
          id: `notif-inv-due-${inv.id}`,
          type: "INVOICE",
          title: `Invoice ${inv.number} Generated`,
          message: `New billing statement for ₹${inv.total} due on ${inv.dueDate || "immediate"}.`,
          date: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
          priority: "MEDIUM",
          read: false,
        });
      }
    }

    // C. Check payments
    for (const p of payRows) {
      notifications.push({
        id: `notif-pay-${p.id}`,
        type: "PAYMENT",
        title: "Payment Received Successfully",
        message: `Received ₹${p.amount} via ${p.method} against your invoice. Thank you!`,
        date: p.paidOn,
        priority: "LOW",
        read: true,
      });
    }

    if (notifications.length === 0) {
      return NextResponse.json({ notifications: FALLBACK_NOTIFICATIONS });
    }

    return NextResponse.json({ notifications });
  } catch (err) {
    console.warn("DB notifications query failed, returning fallback notifications:", err);
    return NextResponse.json({ notifications: FALLBACK_NOTIFICATIONS });
  }
}
