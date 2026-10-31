import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, verifyPassword } from "@/lib/password";
import { signToken, setAuthCookie } from "@/lib/auth";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      customerId: user.customer?.id || null,
    });

    // Default redirect based on role
    let redirectUrl = "/portal/subscriptions";
    if (user.role === "ADMIN") redirectUrl = "/admin/dashboard";
    else if (user.role === "STAFF") redirectUrl = "/staff/dashboard";

    const response = NextResponse.json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        customerId: user.customer?.id || null,
      },
      redirectUrl,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}

