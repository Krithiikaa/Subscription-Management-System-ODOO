"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DateText } from "@/components/shared/date-text";
import { Users, Building2 } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
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
            Customers
          </h1>
          <p className="text-sm text-slate-500">
            All registered organizations and client accounts across the subscription platform.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Company / Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">GSTIN</th>
                  <th className="px-6 py-3.5">City</th>
                  <th className="px-6 py-3.5">Subscriptions</th>
                  <th className="px-6 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No customers found.</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {c.companyName || c.name}
                        </div>
                        {c.companyName && <div className="text-xs text-slate-400 pl-6">{c.name}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {c.email}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {c.gstin || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {c.city || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-medium">
                          {c.subscriptionsCount} subs
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <DateText date={c.createdAt} />
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
