import * as React from "react";
import { cn } from "@/lib/utils";

export type SystemStatus =
  | "DRAFT"
  | "QUOTATION"
  | "CONFIRMED"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

interface StatusBadgeProps {
  status: SystemStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  switch (normalized) {
    case "DRAFT":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Draft
        </span>
      );

    case "QUOTATION":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          Quotation
        </span>
      );

    case "CONFIRMED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          Confirmed
        </span>
      );

    case "ACTIVE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Active
        </span>
      );

    case "PAUSED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Paused
        </span>
      );

    case "CLOSED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Closed
        </span>
      );

    case "PAID":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Paid
        </span>
      );

    case "OVERDUE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          Overdue
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-transparent text-red-600 dark:text-red-400 border border-red-400 dark:border-red-600",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Cancelled
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
            className
          )}
        >
          {status}
        </span>
      );
  }
}

