import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { payments, invoiceLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { getStaffProductIds } from "@/lib/staff-access";
import { PAYMENT_STATUSES, PAYMENT_METHODS } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const method = url.searchParams.get("method");

  const filters = [];
  if (status && (PAYMENT_STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(payments.status, status as (typeof PAYMENT_STATUSES)[number]));
  }
  if (method && (PAYMENT_METHODS as readonly string[]).includes(method)) {
    filters.push(eq(payments.method, method as (typeof PAYMENT_METHODS)[number]));
  }

  if (session.role === "CUSTOMER") {
    if (!session.customerId) return NextResponse.json({ payments: [] });
    filters.push(eq(payments.customerId, session.customerId));
  }

  const rows = await db
    .select()
    .from(payments)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(payments.createdAt);

  let visible = rows;
  if (session.role === "STAFF") {
    const staffProductIds = new Set(await getStaffProductIds(db, session.userId));
    const invoiceIds = [...new Set(rows.map((p) => p.invoiceId))];
    const lines = invoiceIds.length
      ? await db.select({ invoiceId: invoiceLines.invoiceId, productId: invoiceLines.productId }).from(invoiceLines).where(inArray(invoiceLines.invoiceId, invoiceIds))
      : [];
    const visibleInvoiceIds = new Set(lines.filter((l) => staffProductIds.has(l.productId)).map((l) => l.invoiceId));
    visible = rows.filter((p) => visibleInvoiceIds.has(p.invoiceId));
  }

  return NextResponse.json({ payments: visible });
}
