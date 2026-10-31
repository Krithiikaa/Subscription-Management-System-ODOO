import { NextResponse } from "next/server";
import { db } from "@/db";
import { requireApiRole } from "@/lib/api-auth";
import { getDashboardStats, type DateRange } from "@/lib/reports";

export async function GET(request: Request) {
  const auth = await requireApiRole("ADMIN", "STAFF", "CUSTOMER");
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  // No explicit range -> "all time" for time-bound metrics (simplest default
  // for a hackathon demo dataset that doesn't yet span a long history).
  const range: DateRange = from && to ? { from, to } : null;

  const stats = await getDashboardStats(db, {
    role: session.role,
    staffId: session.role === "STAFF" ? session.userId : undefined,
    customerId: session.role === "CUSTOMER" ? session.customerId : undefined,
    range,
  });

  return NextResponse.json(stats);
}
