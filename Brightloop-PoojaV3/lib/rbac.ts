import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getAuthUser, TokenPayload } from "@/lib/auth";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Universal RBAC guard helper for API routes.
 * Throws AuthError or returns the authenticated token payload.
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): Promise<TokenPayload> {
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthError("Authentication required", 401);
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      throw new AuthError("You do not have permission to access this resource", 403);
    }
  }

  return user;
}

/**
 * Helper to catch AuthError in route handlers and return standardized JSON
 */
export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }
  console.error("[API Error]", error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Internal Server Error" },
    { status: 500 }
  );
}

