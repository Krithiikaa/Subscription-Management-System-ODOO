import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, quotationLines, quotationTemplates, quotations, users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { isValidQuotationTransition } from "@/lib/quotation-lifecycle";
import { logAudit } from "@/lib/audit";
import { sendQuotationEmail } from "@/lib/email";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isInteger(quotationId)) return NextResponse.json({ error: "Invalid quotation id" }, { status: 400 });

  const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
  if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  if (!isValidQuotationTransition(quotation.status, "SENT")) {
    return NextResponse.json({ error: `Cannot send a quotation in status ${quotation.status}` }, { status: 409 });
  }

  const lines = await db.select({ productId: quotationLines.productId }).from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
  if (session.role === "STAFF") {
    const allowed = await staffCanAccessAllProducts(db, session.userId, lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not authorized to send a quotation containing one or more of these products" }, { status: 403 });
  }

  let validUntil = quotation.validUntil;
  if (!validUntil) {
    let validityDays = 30;
    if (quotation.templateId) {
      const [template] = await db.select({ validityDays: quotationTemplates.validityDays }).from(quotationTemplates).where(eq(quotationTemplates.id, quotation.templateId)).limit(1);
      if (template) validityDays = template.validityDays;
    }
    validUntil = addDays(new Date(quotation.quotationDate), validityDays).toISOString().slice(0, 10);
  }

  const [customer] = await db
    .select({ email: users.email, name: users.name })
    .from(customers)
    .innerJoin(users, eq(users.id, customers.userId))
    .where(eq(customers.id, quotation.customerId))
    .limit(1);

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(quotations)
      .set({ status: "SENT", validUntil, sentAt: new Date(), updatedAt: new Date() })
      .where(eq(quotations.id, quotationId))
      .returning();
    await logAudit(tx, { userId: session.userId, action: "STATUS_CHANGED", entityType: "quotation", entityId: quotationId, oldValues: { status: quotation.status }, newValues: { status: "SENT" } });
    return row;
  });

  let emailSent = false;
  if (customer) {
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    emailSent = await sendQuotationEmail(customer.email, `${appUrl}/portal/quotations/${quotationId}`, updated.number);
  }

  return NextResponse.json({ quotation: updated, emailSent });
}
