"use client";

import { useEffect, useState } from "react";

type CategoryRow = { id: number; name: string; active: boolean };

export function CategoryManager({ onChange }: { onChange?: () => void }) {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!newName.trim()) return;
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setNewName("");
    await load();
    onChange?.();
  }

  async function toggleActive(c: CategoryRow) {
    await fetch(`/api/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    await load();
    onChange?.();
  }

  async function rename(c: CategoryRow) {
    const next = window.prompt("Rename category", c.name);
    if (!next || next.trim() === "" || next.trim() === c.name) return;
    const res = await fetch(`/api/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    await load();
    onChange?.();
  }

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        Manage categories
      </button>
    );
  }

  return (
    <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="label">Categories</p>
        <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      {error && <div className="badge badge-overdue" style={{ width: "100%" }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="btn-primary" onClick={create}>Add</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {categories.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-sm)", padding: "6px 0", borderBottom: "1px solid var(--hairline)" }}>
            <span>
              {c.name} {!c.active && <span className="badge badge-inactive" style={{ marginLeft: 6 }}>[INACTIVE]</span>}
            </span>
            <span style={{ display: "flex", gap: 6 }}>
              <button className="btn-ghost" onClick={() => rename(c)}>Rename</button>
              <button className="btn-ghost" onClick={() => toggleActive(c)}>{c.active ? "Deactivate" : "Activate"}</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
