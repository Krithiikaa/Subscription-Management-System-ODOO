import { getSession } from "@/lib/session";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Middleware already guarantees a STAFF/ADMIN session reaches this layout.
  const role = session?.role === "ADMIN" ? "ADMIN" : "STAFF";

  return (
    <AdminShell role={role} name={session?.name ?? ""}>
      {children}
    </AdminShell>
  );
}
