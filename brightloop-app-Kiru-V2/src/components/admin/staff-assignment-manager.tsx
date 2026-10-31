"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type StaffOption = { id: number; name: string; email: string };
type ProductOption = { id: number; name: string };
type Assignment = {
  id: number;
  staffId: number;
  staffName: string;
  staffEmail: string;
  productId: number;
  productName: string;
  assignedAt: string;
};

export function StaffAssignmentManager() {
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [productToAssign, setProductToAssign] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    const [staffRes, productsRes, assignmentsRes] = await Promise.all([
      fetch("/api/admin/staff").then((r) => r.json()),
      fetch("/api/products?pageSize=100").then((r) => r.json()),
      fetch("/api/staff-assignments").then((r) => r.json()),
    ]);
    setStaff(staffRes.staff ?? []);
    setProducts(productsRes.products ?? []);
    setAssignments(assignmentsRes.assignments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selectedStaff && staff.length > 0) setSelectedStaff(staff[0].id);
  }, [staff, selectedStaff]);

  const assignmentsForStaff = assignments.filter((a) => a.staffId === selectedStaff);
  const assignedProductIds = new Set(assignmentsForStaff.map((a) => a.productId));
  const availableProducts = products.filter((p) => !assignedProductIds.has(p.id));

  async function assign() {
    if (!selectedStaff || !productToAssign) return;
    setError(null);
    const res = await fetch("/api/staff-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId: selectedStaff, productId: Number(productToAssign) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setProductToAssign("");
    await loadAll();
  }

  async function removeAssignment(id: number) {
    await fetch(`/api/staff-assignments/${id}`, { method: "DELETE" });
    await loadAll();
  }

  if (loading) {
    return <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
      <div className="panel" style={{ padding: 16 }}>
        <p className="label" style={{ padding: "0 8px 10px" }}>Staff</p>
        {staff.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", padding: "0 8px" }}>No staff accounts yet.</p>
        ) : (
          staff.map((s) => {
            const count = assignments.filter((a) => a.staffId === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStaff(s.id)}
                className={`app-nav-item${selectedStaff === s.id ? " active" : ""}`}
                style={{ width: "100%", textAlign: "left", background: selectedStaff === s.id ? undefined : "transparent", border: "none", cursor: "pointer" }}
              >
                <span style={{ flex: 1 }}>{s.name}</span>
                <span className="font-mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{count}</span>
              </button>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {selectedStaff && (
          <>
            <div className="panel" style={{ padding: 20 }}>
              <p className="label" style={{ marginBottom: 10 }}>Assign a product</p>
              {error && <div className="badge badge-overdue" style={{ width: "100%", marginBottom: 10 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <select className="input" style={{ flex: 1 }} value={productToAssign} onChange={(e) => setProductToAssign(e.target.value)}>
                  <option value="">Select a product…</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button className="btn-primary" disabled={!productToAssign} onClick={assign}>Assign</button>
              </div>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <p className="label" style={{ marginBottom: 14 }}>Assigned products</p>
              {assignmentsForStaff.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No products assigned yet.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {assignmentsForStaff.map((a) => (
                    <span key={a.id} className="chip">
                      {a.productName}
                      <span style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>· {formatDate(a.assignedAt)}</span>
                      <button className="chip-remove" onClick={() => removeAssignment(a.id)} aria-label={`Remove ${a.productName}`}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
