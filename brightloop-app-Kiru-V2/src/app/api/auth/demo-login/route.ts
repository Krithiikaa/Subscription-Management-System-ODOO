import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, customers } from "@/db/schema";
import { createSession, setSessionCookie } from "@/lib/session";

// Hackathon demo convenience only: logs in as a seeded demo account by role,
// using server-side env vars. The password never reaches the client or git
// history. Requires DEMO_LOGIN_ENABLED=true so this can't run unintentionally
// in a real deployment.
const DEMO_EMAIL_BY_ROLE: Record<string, string | undefined> = {
  ADMIN: process.env.ADMIN_EMAIL,
  STAFF: process.env.STAFF_EMAIL,
  CUSTOMER: process.env.CUSTOMER_EMAIL,
};

export async function POST(request: Request) {
  if (process.env.DEMO_LOGIN_ENABLED !== "true") {
    return NextResponse.json({ error: "Demo login is disabled" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;
  const email = typeof role === "string" ? DEMO_EMAIL_BY_ROLE[role] : undefined;
  if (!email) {
    return NextResponse.json({ error: "Unknown demo role" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
    .limit(1);

  if (!user || !user.active) {
    return NextResponse.json({ error: "Demo account unavailable" }, { status: 404 });
  }

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
