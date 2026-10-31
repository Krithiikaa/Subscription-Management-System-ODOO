import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

// Public routes — no auth required
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/pricing", "/api/auth", "/api/health"];

// Admin-only route prefixes
const ADMIN_ROUTES = [
  "/admin/discounts",
  "/admin/taxes",
  "/admin/staff",
  "/admin/products",
  "/admin/variants",
  "/admin/plans",
  "/admin/staff-assignments",
];

// Staff + Admin routes (not customer)
const STAFF_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow public routes and Next.js internals
  if (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/cron") // protected by CRON_SECRET inside the route
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("bl_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Admin-only pages
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Staff/Admin pages — customers get redirected to portal
  if (
    STAFF_ROUTES.some((r) => pathname.startsWith(r)) &&
    session.role === "CUSTOMER"
  ) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Customer portal — only customers
  if (pathname.startsWith("/portal") && session.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
