import { NextRequest, NextResponse } from "next/server";
import { runBillingEngine } from "@/lib/billing/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "brightloop-cron-secret-2026";

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid cron authorization token" },
        { status: 401 }
      );
    }

    const result = await runBillingEngine(new Date());

    return NextResponse.json({
      message: "Daily billing engine executed successfully",
      summary: {
        created: result.created,
        skipped: result.skipped,
        failed: result.failed,
      },
      details: result.details,
    });
  } catch (error: any) {
    console.error("[Cron Billing Endpoint Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute billing engine" },
      { status: 500 }
    );
  }
}

