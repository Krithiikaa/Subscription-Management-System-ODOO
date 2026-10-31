"use client";

import * as React from "react";
import { AppShell } from "@/components/shared/app-shell";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <AppShell
      role="STAFF"
      user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
      breadcrumbs={[{ label: "Staff Workspace" }]}
    >
      {children}
    </AppShell>
  );
}
