import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  const res = NextResponse.redirect(url);
  clearAuthCookie(res);
  return res;
}

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });
  clearAuthCookie(res);
  return res;
}

