import * as React from "react";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoneyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number | string | null | undefined;
  colored?: boolean;
}

export function MoneyText({
  amount,
  colored = false,
  className,
  ...props
}: MoneyTextProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount ?? 0);
  const isPositive = num > 0;
  const isNegative = num < 0;

  return (
    <span
      className={cn(
        "tabular-nums font-mono font-medium",
        colored && isPositive && "text-emerald-600 dark:text-emerald-400",
        colored && isNegative && "text-red-600 dark:text-red-400",
        className
      )}
      {...props}
    >
      {formatMoney(amount)}
    </span>
  );
}

