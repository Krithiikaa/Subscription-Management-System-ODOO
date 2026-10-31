import { redirect } from "next/navigation";

/**
 * Root page - redirects to /login.
 * Authentication middleware handles redirecting authenticated users to their portal area.
 */
export default function RootPage() {
  redirect("/login");
}
