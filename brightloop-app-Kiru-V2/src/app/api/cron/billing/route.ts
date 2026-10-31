import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { runBillingCycle } from "@/lib/billing-engine";

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const summary = await runBillingCycle(new Date());
  return NextResponse.json(summary);
}
