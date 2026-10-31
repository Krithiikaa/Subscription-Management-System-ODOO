import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { hashPassword, passwordSchema } from "@/lib/password";

import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const createStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  temporaryPassword: passwordSchema,
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const staffMembers = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff: staffMembers });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, ["ADMIN"]);

    const body = await req.json();
    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { name, temporaryPassword } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(temporaryPassword);

    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STAFF",
        mustChangePassword: true, // required to change on first login
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Staff member created successfully", staff: newStaff },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}

