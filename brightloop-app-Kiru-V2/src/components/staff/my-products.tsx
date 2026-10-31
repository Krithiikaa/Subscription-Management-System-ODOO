"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type AssignmentRow = {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  productStatus: string;
  assignedAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-active",
  INACTIVE: "badge-inactive",
  ARCHIVED: "badge-archived",
};

export function MyProducts() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff-assignments/me")
      .then((r) => r.json())
      .then((data) => setAssignments(data.assignments ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>;
  }

  if (assignments.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No products have been assigned to you yet.</p>;
  }

  return (
    <div className="panel" style={{ padding: 24 }}>
      <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
            <th style={{ padding: "8px 0" }}>Product</th>
            <th>Category</th>
            <th>Status</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id} className="ledger-row">
              <td data-label="Product" style={{ padding: "10px 0" }}>{a.productName}</td>
              <td data-label="Category">{a.productCategory}</td>
              <td data-label="Status">
                <span className={`badge ${STATUS_BADGE[a.productStatus] ?? "badge-draft"}`}>[{a.productStatus}]</span>
              </td>
              <td data-label="Assigned" className="font-mono">{formatDate(a.assignedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
