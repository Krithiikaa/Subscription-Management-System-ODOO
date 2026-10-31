import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, customers } from "@/db/schema";
import { loginSchema } from "@/lib/validation";
import { createSession, setSessionCookie } from "@/lib/session";
import { isLoginRateLimited, recordLoginAttempt } from "@/lib/rate-limit";

const GENERIC_ERROR = "Invalid email or password";

const DEMO_FALLBACK_USERS: Record<
  string,
  { id: number; role: "ADMIN" | "STAFF" | "CUSTOMER"; name: string; customerId?: number }
> = {
  "admin.brightloopoddohack@gmail.com": { id: 1, role: "ADMIN", name: "Admin" },
  "staff.brightloopoddohack@gmail.com": { id: 2, role: "STAFF", name: "Staff" },
  "customer.brightloopoddohack@gmail.com": { id: 3, role: "CUSTOMER", name: "Demo Customer", customerId: 1 },
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (await isLoginRateLimited(normalizedEmail)) {
        return NextResponse.json(
          { error: "Too many failed attempts. Try again in 15 minutes." },
          { status: 429 }
        );
      }
    } catch {
      // Continue gracefully if rate-limit table is unavailable
    }

    let user = null;
    let dbAvailable = true;

    try {
      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(sql`lower(${users.email})`, normalizedEmail))
        .limit(1);
      user = foundUser;
    } catch (dbErr) {
      console.warn("Database lookup failed during login, checking demo fallback:", dbErr);
      dbAvailable = false;
    }

    if (dbAvailable) {
      if (!user) {
        await recordLoginAttempt(normalizedEmail, false, ip).catch(() => {});
        return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        await recordLoginAttempt(normalizedEmail, false, ip).catch(() => {});
        return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
      }

      if (!user.active) {
        await recordLoginAttempt(normalizedEmail, false, ip).catch(() => {});
        return NextResponse.json({ error: "This account has been deactivated" }, { status: 403 });
      }

      await recordLoginAttempt(normalizedEmail, true, ip).catch(() => {});

      let customerId: number | undefined;
      if (user.role === "CUSTOMER") {
        try {
          const [customer] = await db
            .select({ id: customers.id })
            .from(customers)
            .where(eq(customers.userId, user.id))
            .limit(1);
          customerId = customer?.id;
        } catch {
          customerId = 1;
        }
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

    // Database is unavailable / offline fallback:
    // If logging in with one of the standard demo accounts and password is provided (length >= 8).
    // Local development only — the password is never checked here, so in
    // production a transient DB error would otherwise let anyone in as admin.
    const fallbackProfile = process.env.NODE_ENV !== "production" ? DEMO_FALLBACK_USERS[normalizedEmail] : undefined;
    if (fallbackProfile && password.length >= 8) {
      const token = await createSession({
        userId: fallbackProfile.id,
        role: fallbackProfile.role,
        customerId: fallbackProfile.customerId,
        name: fallbackProfile.name,
        email: normalizedEmail,
      });
      await setSessionCookie(token);

      const redirectTo = fallbackProfile.role === "CUSTOMER" ? "/portal" : "/admin/dashboard";
      return NextResponse.json({ ok: true, redirectTo });
    }

    return NextResponse.json(
      {
        error:
          "Database connection unavailable. Please use the Demo profiles below or configure DIRECT_URL in .env.local",
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    console.error("Unhandled error in login route:", err);
    return NextResponse.json(
      { error: "Authentication service error. Please try again or use the Demo profiles below." },
      { status: 500 }
    );
  }
}
