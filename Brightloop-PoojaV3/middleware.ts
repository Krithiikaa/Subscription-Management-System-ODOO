/**
 * Next.js middleware — Phase 0 pass-through skeleton.
 * Full RBAC and customer isolation enforcement added in Phase 1.
 */
import { NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

