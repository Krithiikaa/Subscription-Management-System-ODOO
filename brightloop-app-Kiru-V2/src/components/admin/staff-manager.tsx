"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import type { z } from "zod";

type FormValues = z.infer<typeof createStaffSchema>;

type StaffRow = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
};

export function StaffManager() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createStaffSchema) });

  async function loadStaff() {
    setLoading(true);
    const res = await fetch("/api/admin/staff");
    const data = await res.json();
    setStaff(data.staff ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      reset();
      await loadStaff();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`/api/admin/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    await loadStaff();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="panel" style={{ padding: "24px", maxWidth: "480px" }}>
        <p className="label" style={{ marginBottom: "16px" }}>Add staff member</p>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {formError && (
            <div className="badge badge-overdue" style={{ width: "100%" }}>{formError}</div>
          )}
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" type="text" className="input" {...register("name")} />
            {errors.name && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" {...register("email")} />
            {errors.email && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.email.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">Temporary password</label>
            <input id="password" type="password" className="input" {...register("password")} />
            {errors.password && <p style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: "4px" }}>{errors.password.message}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Adding…" : "Add staff"}
          </button>
        </form>
      </div>

      <div className="panel" style={{ padding: "24px" }}>
        <p className="label" style={{ marginBottom: "16px" }}>Staff accounts</p>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</p>
        ) : staff.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No staff accounts yet.</p>
        ) : (
          <table className="ledger-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                <th style={{ padding: "8px 0" }}>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="ledger-row">
                  <td data-label="Name" style={{ padding: "10px 0" }}>{s.name}</td>
                  <td data-label="Email" className="font-mono">{s.email}</td>
                  <td data-label="Status">
                    <span className={`badge ${s.active ? "badge-active" : "badge-closed"}`}>
                      {s.active ? "[ACTIVE]" : "[INACTIVE]"}
                    </span>
                  </td>
                  <td data-label="Added" className="font-mono">{formatDate(s.createdAt)}</td>
                  <td data-label="">
                    <button className="btn-ghost" onClick={() => toggleActive(s.id, s.active)}>
                      {s.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
