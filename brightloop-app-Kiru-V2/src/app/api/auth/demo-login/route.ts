import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, customers } from "@/db/schema";
import { createSession, setSessionCookie } from "@/lib/session";

// Hackathon demo convenience: logs in as a seeded demo account by role.
// The password never reaches the client or git history.
const DEMO_EMAIL_BY_ROLE: Record<string, string> = {
  ADMIN: process.env.ADMIN_EMAIL || "admin.brightloopoddohack@gmail.com",
  STAFF: process.env.STAFF_EMAIL || "staff.brightloopoddohack@gmail.com",
  CUSTOMER: process.env.CUSTOMER_EMAIL || "customer.brightloopoddohack@gmail.com",
};

export async function POST(request: Request) {
  try {
    const isDemoEnabled =
      process.env.DEMO_LOGIN_ENABLED === "true" ||
      process.env.DEMO_LOGIN_ENABLED === undefined ||
      process.env.NODE_ENV !== "production";

    if (!isDemoEnabled) {
      return NextResponse.json({ error: "Demo login is disabled" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const role = body?.role;
    const email = typeof role === "string" ? DEMO_EMAIL_BY_ROLE[role] : undefined;
    if (!email || !["ADMIN", "STAFF", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ error: "Unknown demo role" }, { status: 400 });
    }

    let user: {
      id: number;
      role: "ADMIN" | "STAFF" | "CUSTOMER";
      name: string;
      email: string;
      active: boolean;
    } | null = null;
    let customerId: number | undefined;

    // 1. Attempt lookup from DB if reachable
    try {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
        .limit(1);

      if (dbUser && dbUser.active) {
        user = dbUser;
        if (user.role === "CUSTOMER") {
          const [customer] = await db
            .select({ id: customers.id })
            .from(customers)
            .where(eq(customers.userId, user.id))
            .limit(1);
          customerId = customer?.id ?? 1;
        }
      }
    } catch (dbErr) {
      console.warn("Database unavailable during demo login, using fallback demo session:", dbErr);
    }

    // 2. Fallback demo session if DB is unseeded or offline
    if (!user) {
      const fallbackProfiles: Record<string, { id: number; name: string }> = {
        ADMIN: { id: 1, name: "Admin" },
        STAFF: { id: 2, name: "Staff" },
        CUSTOMER: { id: 3, name: "Demo Customer" },
      };
      const profile = fallbackProfiles[role] ?? { id: 1, name: role };
      user = {
        id: profile.id,
        role: role as "ADMIN" | "STAFF" | "CUSTOMER",
        name: profile.name,
        email,
        active: true,
      };
      if (user.role === "CUSTOMER") {
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
  } catch (err: unknown) {
    console.error("Demo login unexpected error:", err);
    return NextResponse.json(
      { error: "Demo login failed. Please try again." },
      { status: 500 }
    );
  }
}
