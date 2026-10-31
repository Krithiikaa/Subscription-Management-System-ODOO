import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
  className?: string;
}

export function validatePasswordRules(pwd: string = "") {
  return {
    length: pwd.length >= 9,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };
}

export function PasswordStrength({ password = "", className }: PasswordStrengthProps) {
  const rules = validatePasswordRules(password);
  const passedCount = Object.values(rules).filter(Boolean).length;
  const percentage = (passedCount / 4) * 100;

  const getMeterColor = () => {
    if (passedCount <= 1) return "bg-red-500";
    if (passedCount === 2) return "bg-amber-500";
    if (passedCount === 3) return "bg-blue-500";
    return "bg-emerald-500";
  };

  return (
    <div className={cn("space-y-3 pt-1", className)}>
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300 rounded-full", getMeterColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {rules.length ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={rules.length ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-500"}>
            9+ characters
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {rules.hasUpper ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={rules.hasUpper ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-500"}>
            Uppercase letter
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {rules.hasLower ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={rules.hasLower ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-500"}>
            Lowercase letter
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {rules.hasSpecial ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={rules.hasSpecial ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-500"}>
            Special character
          </span>
        </div>
      </div>
    </div>
  );
}

