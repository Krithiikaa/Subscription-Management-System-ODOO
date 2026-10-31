import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createStaffSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const staff = await db
    .select({ id: users.id, name: users.name, email: users.email, active: users.active, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.role, "STAFF"))
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [staffUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "STAFF" })
    .returning({ id: users.id, name: users.name, email: users.email, active: users.active });

  return NextResponse.json({ staff: staffUser }, { status: 201 });
}
