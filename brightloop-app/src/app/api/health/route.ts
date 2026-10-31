import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", phase: "Phase 0 – scaffold deployed" });
}
