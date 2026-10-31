import { z } from "zod";

// Password rule: >8 chars (9+), at least one upper, one lower, one special character.
export const passwordSchema = z
  .string()
  .min(9, "Password must be at least 9 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const emailSchema = z.string().trim().toLowerCase().email("Invalid email address");

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: emailSchema,
  password: passwordSchema,
});

export const updateStaffSchema = z.object({
  active: z.boolean(),
});
