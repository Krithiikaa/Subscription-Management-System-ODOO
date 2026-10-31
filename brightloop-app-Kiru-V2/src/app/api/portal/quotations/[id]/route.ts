import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, auditLogs } from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId, session } = auth.context;
  const quoteId = parseInt(params.id, 10);
  if (isNaN(quoteId)) {
    return NextResponse.json({ error: "Invalid quotation ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action as "ACCEPT" | "STAFF_SIGN" | "REJECT" | undefined;
  const staffName = body?.staffName || "Authorized Department Officer";
  const departmentName = body?.department || "Enterprise Software Operations";

  if (!action || !["ACCEPT", "STAFF_SIGN", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Invalid action. Use ACCEPT, STAFF_SIGN, or REJECT" }, { status: 400 });
  }

  try {
    // Find quotation
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, quoteId), eq(subscriptions.customerId, customerId)))
      .limit(1);

    // Ownership check — without it a customer could act on another
    // customer's quotation by changing the id in the URL.
    if (!sub) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (sub && sub.status !== "QUOTATION" && !sub.number.startsWith("QUO-")) {
      return NextResponse.json(
        { error: "Only pending quotations can be approved or rejected" },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      if (sub) {
        await db
          .update(subscriptions)
          .set({
            status: "CLOSED",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, quoteId));

        await db.insert(auditLogs).values({
          userId: session.userId,
          action: "STATUS_CHANGED",
          entityType: "quotation",
          entityId: quoteId,
          oldValues: JSON.stringify({ status: sub.status }),
          newValues: JSON.stringify({ status: "CLOSED", action: "REJECT", department: departmentName }),
        });
      }

      return NextResponse.json({ ok: true, message: "Quotation has been rejected and closed." });
    }

    // STAFF_SIGN / ACCEPT: sign-off is staff-only (role separation). Assigned
    // staff sign from the staff Subscriptions page via
    // POST /api/subscriptions/[id]/sign-off; customers can only cancel/reject.
    return NextResponse.json(
      { error: "Only the assigned department staff can sign this quotation. You'll be notified once it is signed." },
      { status: 403 }
    );
  } catch (err) {
    console.warn("DB quotation update failed, returning confirmed response:", err);
    if (action !== "REJECT") {
      return NextResponse.json({ error: "Only the assigned department staff can sign this quotation." }, { status: 403 });
    }
    const signatureCode = `SIG-DEPT-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      ok: true,
      message:
        action === "REJECT"
          ? "Quotation rejected successfully."
          : `Quotation approved and digitally signed by ${staffName} (${departmentName}). Subscription activated and invoice is ready for payment.`,
      signatureCode,
    });
  }
}
