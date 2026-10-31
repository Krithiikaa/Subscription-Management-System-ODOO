import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { runBillingEngine } from "@/lib/billing/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Only Admin can manually trigger run billing
    await requireAuth(req, ["ADMIN"]);

    const result = await runBillingEngine(new Date());

    return NextResponse.json({
      message: "Billing run completed",
      summary: {
        created: result.created,
        skipped: result.skipped,
        failed: result.failed,
      },
      details: result.details,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

