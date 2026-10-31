import { LogoutButton } from "@/components/shared/logout-button";
import { StaffManager } from "@/components/admin/staff-manager";

export default function AdminStaffPage() {
  return (
    <main style={{ minHeight: "100dvh", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <p className="label">Admin</p>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", margin: "4px 0 0" }}>
            Staff management
          </h1>
        </div>
        <LogoutButton />
      </div>

      <StaffManager />
    </main>
  );
}
