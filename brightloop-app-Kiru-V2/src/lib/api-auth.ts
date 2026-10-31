import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";

type Role = "ADMIN" | "STAFF" | "CUSTOMER";

export async function requireApiRole(
  ...roles: Role[]
): Promise<{ session: SessionPayload } | { response: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!roles.includes(session.role)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
