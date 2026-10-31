import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/password";
import { Resend } from "resend";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_test_key");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    // Constant response whether user exists or not (prevents user enumeration)
    const standardResponse = NextResponse.json({
      message: "If that email is registered, a password reset link has been sent.",
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return standardResponse;
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    // Invalidate prior unused tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    // Save token hash
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send email via Resend
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

    try {
      if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("mock")) {
        await resend.emails.send({
          from: "BrightLoop Support <billing@brightloop.io>",
          to: email,
          subject: "Reset your BrightLoop password",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Reset your BrightLoop password</h2>
              <p>Hello ${user.name},</p>
              <p>You requested a password reset. Click the button below to reset your password. This link is valid for 30 minutes.</p>
              <p style="margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Reset Password
                </a>
              </p>
              <p style="color: #64748B; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } else {
        console.log(`[DEV/MOCK EMAIL] Password reset token generated for ${email}: ${resetLink}`);
      }
    } catch (emailErr) {
      console.error("[Email send failed, logged link]", resetLink, emailErr);
    }

    return standardResponse;
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json(
      { message: "If that email is registered, a password reset link has been sent." },
      { status: 200 }
    );
  }
}

