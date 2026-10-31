import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function POST(request: Request) {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { session, customerId } = auth.context;
  const body = await request.json().catch(() => null);

  const subject = body?.subject?.trim();
  const message = body?.message?.trim();
  const priority = body?.priority || "NORMAL";
  const referenceType = body?.referenceType || "GENERAL";
  const referenceId = body?.referenceId || null;

  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required for support requests" },
      { status: 400 }
    );
  }

  const ticketNumber = `TKT-${nanoid(6).toUpperCase()}`;

  // Log in audit log as support ticket
  await db.insert(auditLogs).values({
    userId: session.userId,
    action: "CREATED",
    entityType: "support_ticket",
    entityId: customerId,
    newValues: JSON.stringify({
      ticketNumber,
      subject,
      message,
      priority,
      referenceType,
      referenceId,
      status: "OPEN",
      submittedAt: new Date().toISOString(),
    }),
  }).catch((err) => {
    console.warn("DB audit log failed for support ticket:", err);
  });

  return NextResponse.json({
    ok: true,
    ticketNumber,
    status: "OPEN",
    message: `Support ticket ${ticketNumber} registered. Our engineering support desk will reply within 4 business hours.`,
  });
}

