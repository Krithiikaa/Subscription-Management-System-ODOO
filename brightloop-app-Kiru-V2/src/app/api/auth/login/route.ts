import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, customers } from "@/db/schema";
import { loginSchema } from "@/lib/validation";
import { createSession, setSessionCookie } from "@/lib/session";
import { isLoginRateLimited, recordLoginAttempt } from "@/lib/rate-limit";

const GENERIC_ERROR = "Invalid email or password";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (await isLoginRateLimited(email)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  if (!user) {
    await recordLoginAttempt(email, false, ip);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    await recordLoginAttempt(email, false, ip);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!user.active) {
    await recordLoginAttempt(email, false, ip);
    return NextResponse.json({ error: "This account has been deactivated" }, { status: 403 });
  }

  await recordLoginAttempt(email, true, ip);

  let customerId: number | undefined;
  if (user.role === "CUSTOMER") {
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.userId, user.id))
      .limit(1);
    customerId = customer?.id;
  }

  const token = await createSession({
    userId: user.id,
    role: user.role,
    customerId,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  const redirectTo = user.role === "CUSTOMER" ? "/portal" : "/admin/dashboard";
  return NextResponse.json({ ok: true, redirectTo });
}
