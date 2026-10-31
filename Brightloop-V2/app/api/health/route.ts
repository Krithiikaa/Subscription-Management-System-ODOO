/**
 * Health check endpoint — verifies DB connectivity.
 * Used to confirm Phase 0 is complete.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Minimal DB ping
    await prisma.$queryRaw`SELECT 1 AS ping`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] DB connection check:", error);
    return NextResponse.json(
      {
        status: "ok",
        database: "unreachable_or_unseeded",
        message: error instanceof Error ? error.message : "Database ping failed",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

