import { StaffManager } from "@/components/admin/staff-manager";

export default function AdminStaffPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Admin</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Staff management
        </h2>
      </div>
      <StaffManager />
    </div>
  );
}
