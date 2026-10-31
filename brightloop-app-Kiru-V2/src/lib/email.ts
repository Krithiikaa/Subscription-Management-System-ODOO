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
