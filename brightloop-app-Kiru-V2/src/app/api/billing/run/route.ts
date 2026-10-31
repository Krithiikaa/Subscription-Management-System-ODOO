import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { runBillingSchema } from "@/lib/validation";
import { runBillingCycle } from "@/lib/billing-engine";

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const parsed = runBillingSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const summary = await runBillingCycle(new Date(), { dryRun: parsed.data.dryRun, limit: parsed.data.limit });
  return NextResponse.json(summary);
}
