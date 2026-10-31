import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, customers } from "@/db/schema";
import { signupSchema } from "@/lib/validation";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
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

  // Public signup always creates a CUSTOMER account — role is never taken from the request.
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "CUSTOMER" })
    .returning({ id: users.id, role: users.role, name: users.name, email: users.email });

  const [customer] = await db.insert(customers).values({ userId: user.id }).returning({ id: customers.id });

  const token = await createSession({
    userId: user.id,
    role: user.role,
    customerId: customer.id,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
