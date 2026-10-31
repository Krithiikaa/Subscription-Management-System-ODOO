import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation";

describe("passwordSchema", () => {
  it("accepts a password meeting all rules", () => {
    expect(passwordSchema.safeParse("GoodPass1!").success).toBe(true);
  });

  it("rejects passwords 8 characters or shorter", () => {
    expect(passwordSchema.safeParse("Aa1!567").success).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    expect(passwordSchema.safeParse("goodpass1!").success).toBe(false);
  });

  it("rejects a password missing a lowercase letter", () => {
    expect(passwordSchema.safeParse("GOODPASS1!").success).toBe(false);
  });

  it("rejects a password missing a special character", () => {
    expect(passwordSchema.safeParse("GoodPass1").success).toBe(false);
  });
});

describe("signupSchema", () => {
  const base = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "GoodPass1!",
    confirmPassword: "GoodPass1!",
  };

  it("accepts valid signup data", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(signupSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    expect(signupSchema.safeParse({ ...base, confirmPassword: "Different1!" }).success).toBe(false);
  });

  it("ignores any extra 'role' field rather than validating it", () => {
    const withRole = { ...base, role: "ADMIN" };
    const parsed = signupSchema.safeParse(withRole);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("role");
    }
  });

  it("lowercases the email", () => {
    const parsed = signupSchema.safeParse({ ...base, email: "Jane@Example.com" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("jane@example.com");
    }
  });
});

describe("loginSchema", () => {
  it("requires an email and a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "anything" }).success).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("requires a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc",
      password: "GoodPass1!",
      confirmPassword: "Mismatch1!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching strong passwords with a token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc",
      password: "GoodPass1!",
      confirmPassword: "GoodPass1!",
    });
    expect(result.success).toBe(true);
  });
});
