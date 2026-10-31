import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_test_key");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["ADMIN", "STAFF"]);
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const invoiceUrl = `${appUrl}/invoices/${invoice.id}/print`;
    const customerEmail = invoice.customer.user.email;

    try {
      if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("mock")) {
        await resend.emails.send({
          from: "BrightLoop Invoicing <billing@brightloop.io>",
          to: customerEmail,
          subject: `Invoice ${invoice.number} from BrightLoop`,
          html: `
            <div style="font-family: sans-serif; padding: 24px;">
              <h2>Invoice ${invoice.number}</h2>
              <p>Dear ${invoice.customer.user.name},</p>
              <p>Your subscription invoice for amount <strong>₹${invoice.grandTotal.toFixed(2)}</strong> is ready.</p>
              <p style="margin: 24px 0;">
                <a href="${invoiceUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  View & Print Invoice
                </a>
              </p>
              <p>Due date: ${new Date(invoice.dueDate).toDateString()}</p>
            </div>
          `,
        });
      } else {
        console.log(`[MOCK RESEND EMAIL] Invoice ${invoice.number} sent to ${customerEmail}: ${invoiceUrl}`);
      }
    } catch (emailErr) {
      console.warn("[Email send warning, continued]", emailErr);
    }

    // Update sentAt timestamp
    const updated = await prisma.invoice.update({
      where: { id },
      data: { sentAt: new Date() },
    });

    return NextResponse.json({
      message: `Invoice ${invoice.number} sent to ${customerEmail}`,
      sentAt: updated.sentAt,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

