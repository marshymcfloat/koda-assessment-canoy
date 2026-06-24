import { AlertTriangle } from "lucide-react";
import { getSummary } from "@/lib/projects/data";
import { STATUSES } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

/** Solid status color (bar fill + dot), keyed by status label. */
const STATUS_COLOR: Record<string, string> = {
  Planning: "bg-status-planning",
  "In Progress": "bg-status-progress",
  "On Hold": "bg-status-hold",
  Completed: "bg-status-completed",
};

/**
 * Dashboard summary (bonus). An asymmetric band rather than a flat 6-up grid:
 * a hero "Total" figure, a status breakdown with proportion bars, and an
 * Overdue alert that only draws attention when something is actually overdue.
 * Reads the cached summary; refreshes after mutations via the `projects` tag.
 */
export async function SummaryStrip() {
  const summary = await getSummary();
  const total = summary.total || 1; // avoid divide-by-zero for the bars

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Hero: total projects */}
      <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card ring-1 ring-primary/15 max-sm:aspect-square max-sm:justify-center">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 size-28 rounded-full bg-primary/10 blur-2xl"
        />
        <dt className="eyebrow">Total projects</dt>
        <dd className="tabular mt-2 font-display text-5xl font-semibold leading-none tracking-tight">
          {summary.total}
        </dd>
        <p className="mt-3 text-xs text-muted-foreground">Across all clients</p>
      </div>

      {/* Status breakdown with proportion bars */}
      <div className="order-last col-span-2 rounded-xl border border-border bg-card p-5 shadow-card lg:order-0 lg:col-span-2">
        <dt className="eyebrow">By status</dt>
        <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {STATUSES.map((status) => {
            const value = summary.byStatus[status];
            const pct = Math.round((value / total) * 100);
            return (
              <div key={status}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm text-foreground">
                    <span
                      aria-hidden
                      className={cn("size-1.5 rounded-full", STATUS_COLOR[status])}
                    />
                    {status}
                  </span>
                  <span className="tabular text-sm font-semibold text-foreground">
                    {value}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"
                  aria-hidden
                >
                  <span
                    className={cn("block h-full rounded-full", STATUS_COLOR[status])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue alert — calm at zero, urgent otherwise */}
      <div
        className={cn(
          "flex flex-col justify-between rounded-xl border p-5 shadow-card transition-colors max-sm:aspect-square max-sm:justify-center",
          summary.overdue > 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-border bg-card",
        )}
      >
        <dt className="flex items-center gap-1.5 eyebrow">
          {summary.overdue > 0 && (
            <AlertTriangle className="size-3.5 text-destructive" aria-hidden />
          )}
          Overdue
        </dt>
        <dd
          className={cn(
            "tabular mt-2 font-display text-5xl font-semibold leading-none tracking-tight",
            summary.overdue > 0 && "text-destructive",
          )}
        >
          {summary.overdue}
        </dd>
        <p className="mt-3 text-xs text-muted-foreground">
          {summary.overdue > 0 ? "Need attention" : "All on schedule"}
        </p>
      </div>
    </dl>
  );
}
