"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DateText } from "@/components/shared/date-text";
import { UserCheck, Shield } from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/staff")
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaff(data.staff);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Internal Staff & Admins
          </h1>
          <p className="text-sm text-slate-500">
            Internal team members with access to customer subscriptions and operations.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading staff...</td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No staff members found.</td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {member.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1.5 ${
                          member.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}>
                          <Shield className="h-3 w-3" /> {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {member.isActive ? (
                          <span className="text-xs font-medium text-emerald-600">Active</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <DateText date={member.createdAt} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
