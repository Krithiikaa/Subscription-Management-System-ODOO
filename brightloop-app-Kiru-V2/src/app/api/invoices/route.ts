import { NextResponse } from "next/server";
import { and, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { invoices, invoiceLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { getStaffProductIds } from "@/lib/staff-access";
import { INVOICE_STATUSES } from "@/lib/validation";
import { isInvoiceOverdue } from "@/lib/billing-engine";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const customerIdParam = url.searchParams.get("customerId");
  const subscriptionIdParam = url.searchParams.get("subscriptionId");
  const numberSearch = url.searchParams.get("number");
  const overdueOnly = url.searchParams.get("overdue") === "true";

  const filters = [];
  if (status && (INVOICE_STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(invoices.status, status as (typeof INVOICE_STATUSES)[number]));
  }
  if (numberSearch) filters.push(like(invoices.number, `%${numberSearch}%`));
  if (subscriptionIdParam && Number.isInteger(Number(subscriptionIdParam))) {
    filters.push(eq(invoices.subscriptionId, Number(subscriptionIdParam)));
  }

  if (session.role === "CUSTOMER") {
    if (!session.customerId) return NextResponse.json({ invoices: [] });
    filters.push(eq(invoices.customerId, session.customerId));
  } else if (customerIdParam && Number.isInteger(Number(customerIdParam))) {
    filters.push(eq(invoices.customerId, Number(customerIdParam)));
  }

  const rows = await db
    .select()
    .from(invoices)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(invoices.createdAt);

  let visible = rows;
  if (session.role === "STAFF") {
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const lines = await db.select({ invoiceId: invoiceLines.invoiceId, productId: invoiceLines.productId }).from(invoiceLines);
    const visibleIds = new Set(lines.filter((l) => staffProductIds.has(l.productId)).map((l) => l.invoiceId));
    visible = rows.filter((inv) => visibleIds.has(inv.id));
  }

  if (overdueOnly) visible = visible.filter((inv) => isInvoiceOverdue(inv));

  return NextResponse.json({ invoices: visible });
}
