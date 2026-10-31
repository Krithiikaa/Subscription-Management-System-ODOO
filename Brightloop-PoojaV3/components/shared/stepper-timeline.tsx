import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface TimelineStep {
  status: string;
  label: string;
  date?: Date | string | null;
  changedBy?: string | null;
  note?: string | null;
}

interface StepperTimelineProps {
  currentStatus: string;
  history?: Array<{
    toStatus: string;
    createdAt: Date | string;
    changedBy?: { name: string } | null;
    note?: string | null;
  }>;
  className?: string;
}

const DEFAULT_STEPS = [
  { status: "DRAFT", label: "Draft" },
  { status: "QUOTATION", label: "Quotation Sent" },
  { status: "CONFIRMED", label: "Order Confirmed" },
  { status: "ACTIVE", label: "Subscription Active" },
  { status: "CLOSED", label: "Closed" },
];

export function StepperTimeline({
  currentStatus,
  history = [],
  className,
}: StepperTimelineProps) {
  const normalizedCurrent = (currentStatus || "").toUpperCase();

  const getStepState = (status: string, index: number) => {
    const statuses = DEFAULT_STEPS.map((s) => s.status);
    const currentIndex = statuses.indexOf(normalizedCurrent);
    if (currentIndex === -1) {
      if (normalizedCurrent === "PAUSED") return index <= 3 ? "completed" : "upcoming";
      return "upcoming";
    }
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="relative pl-6 after:absolute after:inset-y-2 after:left-2.5 after:w-0.5 after:bg-slate-200 dark:after:bg-slate-800">
        {DEFAULT_STEPS.map((step, idx) => {
          const state = getStepState(step.status, idx);
          const historyItem = history.find(
            (h) => (h.toStatus || "").toUpperCase() === step.status
          );

          return (
            <div key={step.status} className="relative mb-6 last:mb-0">
              {/* Dot Icon */}
              <div
                className={cn(
                  "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] z-10 transition-colors",
                  state === "completed" &&
                    "border-indigo-600 bg-indigo-600 text-white shadow-sm",
                  state === "current" &&
                    "border-indigo-600 bg-white dark:bg-slate-900 text-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950/60 font-bold",
                  state === "upcoming" &&
                    "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400"
                )}
              >
                {state === "completed" ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-semibold tracking-tight font-heading",
                    state === "current" && "text-indigo-600 dark:text-indigo-400",
                    state === "completed" && "text-slate-900 dark:text-slate-100",
                    state === "upcoming" && "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.label}
                </span>

                {historyItem ? (
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>{formatDate(historyItem.createdAt)}</div>
                    {historyItem.changedBy?.name && (
                      <div className="text-slate-400 dark:text-slate-500">
                        by {historyItem.changedBy.name}
                      </div>
                    )}
                    {historyItem.note && (
                      <div className="italic text-slate-500">{historyItem.note}</div>
                    )}
                  </div>
                ) : (
                  state === "current" && (
                    <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mt-0.5">
                      Current stage
                    </span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

