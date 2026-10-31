import { ZodError } from "zod";

export function formatZodError(error: ZodError | any): string {
  if (error?.issues && Array.isArray(error.issues) && error.issues.length > 0) {
    return error.issues[0].message;
  }
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0].message;
  }
  return "Validation failed";
}

