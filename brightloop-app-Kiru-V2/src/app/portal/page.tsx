import { getSession } from "@/lib/session";
import { PortalShell } from "@/components/portal/portal-shell";
import { redirect } from "next/navigation";

export default async function PortalPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "CUSTOMER") {
    redirect("/admin/dashboard");
  }

  return <PortalShell />;
}
