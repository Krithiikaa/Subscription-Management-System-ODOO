import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema, hashPassword } from "@/lib/password";
import { signToken, setAuthCookie } from "@/lib/auth";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { name, password, companyName, phone } = parsed.data;

    // 1. Code-level duplicate check
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Create user + customer profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: "CUSTOMER",
        },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          companyName: companyName || null,
          phone: phone || null,
        },
      });

      return { user, customer };
    });

    // 4. Issue JWT
    const token = await signToken({
      userId: newUser.user.id,
      role: newUser.user.role,
      email: newUser.user.email,
      customerId: newUser.customer.id,
    });

    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser.user.id,
          name: newUser.user.name,
          email: newUser.user.email,
          role: newUser.user.role,
          customerId: newUser.customer.id,
        },
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    // DB unique constraint fallback check
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }
    console.error("[Signup Error]", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

