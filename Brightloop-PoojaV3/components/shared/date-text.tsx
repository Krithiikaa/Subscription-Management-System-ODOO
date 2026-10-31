import * as React from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DateTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  date: Date | string | null | undefined;
}

export function DateText({ date, className, ...props }: DateTextProps) {
  return (
    <span className={cn("text-sm text-slate-600 dark:text-slate-400", className)} {...props}>
      {formatDate(date)}
    </span>
  );
}

