import { describe, it, expect } from "vitest";
import { passwordSchema, hashPassword, verifyPassword } from "@/lib/password";
import { signToken, verifyToken } from "@/lib/auth";

describe("Phase 1: Password & Auth Security Rules", () => {
  it("rejects passwords with 8 characters or fewer", () => {
    // 8 characters should fail (spec: MORE than 8 characters, min 9)
    const result = passwordSchema.safeParse("Pass@123");
    expect(result.success).toBe(false);
  });

  it("rejects passwords missing uppercase, lowercase, or special character", () => {
    // Missing uppercase
    expect(passwordSchema.safeParse("password@123").success).toBe(false);
    // Missing lowercase
    expect(passwordSchema.safeParse("PASSWORD@123").success).toBe(false);
    // Missing special character
    expect(passwordSchema.safeParse("Password123").success).toBe(false);
  });

  it("accepts valid passwords meeting all 4 rules", () => {
    // 9+ chars, upper, lower, special
    expect(passwordSchema.safeParse("Bright@2026").success).toBe(true);
    expect(passwordSchema.safeParse("Super#Secret99").success).toBe(true);
  });

  it("hashes and securely verifies passwords with bcryptjs", async () => {
    const raw = "SecurePass@2026";
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(await verifyPassword(raw, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword#1", hash)).toBe(false);
  });

  it("signs and verifies jose JWT tokens with role and customerId", async () => {
    const payload = {
      userId: "user_123",
      role: "CUSTOMER" as const,
      email: "pooja@example.com",
      customerId: "cust_456",
    };

    const token = await signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe("user_123");
    expect(decoded?.role).toBe("CUSTOMER");
    expect(decoded?.customerId).toBe("cust_456");
  });
});

