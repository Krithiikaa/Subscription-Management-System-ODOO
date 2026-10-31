import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "brightloop-default-development-secret-key-32chars";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "brightloop_token";

export interface TokenPayload {
  userId: string;
  role: Role;
  email: string;
  customerId?: string | null;
}

/**
 * Sign JWT with jose
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verify JWT with jose
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as Role,
      email: payload.email as string,
      customerId: (payload.customerId as string) || null,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Set HTTP-only secure cookie
 */
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Extract auth user from NextRequest
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };

