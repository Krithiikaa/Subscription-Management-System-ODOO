import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const rows = await db
    .select({ id: customers.id, name: users.name, email: users.email, companyName: customers.companyName })
    .from(customers)
    .innerJoin(users, eq(users.id, customers.userId))
    .orderBy(users.name);

  return NextResponse.json({ customers: rows });
}
