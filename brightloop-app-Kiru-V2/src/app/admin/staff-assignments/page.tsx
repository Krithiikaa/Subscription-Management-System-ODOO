import { StaffAssignmentManager } from "@/components/admin/staff-assignment-manager";

export default function AdminStaffAssignmentsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p className="label">Catalogue</p>
        <h2 className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "4px 0 0" }}>
          Staff assignments
        </h2>
      </div>
      <StaffAssignmentManager />
    </div>
  );
}
