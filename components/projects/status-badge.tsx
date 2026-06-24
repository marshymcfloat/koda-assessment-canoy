import { cn } from "@/lib/utils";
import type { Status } from "@/lib/projects/types";

/** Per-status token classes (soft background + accent text + dot). */
const STATUS_STYLES: Record<Status, string> = {
  Planning: "bg-status-planning-bg text-status-planning",
  "In Progress": "bg-status-progress-bg text-status-progress",
  "On Hold": "bg-status-hold-bg text-status-hold",
  Completed: "bg-status-completed-bg text-status-completed",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}
