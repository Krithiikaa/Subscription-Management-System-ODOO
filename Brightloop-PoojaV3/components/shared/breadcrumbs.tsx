import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn("flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400", className)}
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 stroke-[2]" />
            {isLast || !item.href ? (
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

