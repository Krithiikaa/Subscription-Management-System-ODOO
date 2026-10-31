import nodemailer from "nodemailer";

function getTransport() {
  const { BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS } = process.env;
  if (!BREVO_SMTP_HOST || !BREVO_SMTP_USER || !BREVO_SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: Number(BREVO_SMTP_PORT ?? 587),
    secure: false,
    auth: { user: BREVO_SMTP_USER, pass: BREVO_SMTP_PASS },
  });
}

export async function sendQuotationEmail(to: string, quotationUrl: string, quotationNumber: string): Promise<boolean> {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[dev] Quotation ${quotationNumber} link for ${to}: ${quotationUrl}`);
      return true;
    }
    console.error("Email not sent: SMTP is not configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? "no-reply@brightloop.demo",
      to,
      subject: `Quotation ${quotationNumber} from Brightloop`,
      text: `You have a new quotation (${quotationNumber}) ready for review: ${quotationUrl}\n\nLog in to your Brightloop account to view the full breakdown and respond.`,
      html: `<p>You have a new quotation <strong>${quotationNumber}</strong> ready for review.</p><p><a href="${quotationUrl}">View and respond to the quotation</a></p><p>Log in to your Brightloop account if the link doesn't work directly.</p>`,
    });
    return true;
  } catch (err) {
    console.error(`Failed to send quotation email for ${quotationNumber}:`, err);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[dev] Password reset link for ${to}: ${resetUrl}`);
      return true;
    }
    console.error("Email not sent: SMTP is not configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? "no-reply@brightloop.demo",
      to,
      subject: "Reset your Brightloop password",
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
      html: `<p>Reset your password by clicking the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
    });
    return true;
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return false;
  }
}
