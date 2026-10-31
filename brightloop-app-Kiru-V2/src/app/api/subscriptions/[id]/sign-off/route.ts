import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptionLines, subscriptions } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { staffCanAccessAllProducts } from "@/lib/staff-access";
import { signOffQuotation } from "@/lib/quotation-signoff";

// Department sign-off by an authenticated staff member (or admin). The
// signature carries the signer's own name from their session — staff must be
// assigned to every product on the quotation, same rule as every other
// staff action on subscriptions.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isInteger(subscriptionId)) return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const notes = typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 500) : "Approved & digitally signed by department staff";

  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (subscription.status !== "QUOTATION") {
    return NextResponse.json({ error: `Only a pending quotation can be signed off (status: ${subscription.status})` }, { status: 409 });
  }

  if (session.role === "STAFF") {
    const lines = await db.select({ productId: subscriptionLines.productId }).from(subscriptionLines).where(eq(subscriptionLines.subscriptionId, subscriptionId));
    const allowed = await staffCanAccessAllProducts(db, session.userId, lines.map((l) => l.productId));
    if (!allowed) return NextResponse.json({ error: "You are not assigned to every product on this quotation" }, { status: 403 });
  }

  const result = await signOffQuotation({ subscriptionId, signerUserId: session.userId, staffName: session.name, staffNotes: notes });

  return NextResponse.json({
    subscription: result.activatedSub,
    invoice: result.newInvoice,
    signatureCode: result.signatureCode,
  });
}
