import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/projects/types";

const PRIORITY_TEXT: Record<Priority, string> = {
  High: "text-priority-high",
  Medium: "text-priority-medium",
  Low: "text-priority-low",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        PRIORITY_TEXT[priority],
        className,
      )}
    >
      <span className="size-2 rounded-[3px] bg-current" aria-hidden />
      {priority}
    </span>
  );
}

/** Left accent-bar color for cards/rows, keyed by priority. */
export const PRIORITY_BAR: Record<Priority, string> = {
  High: "bg-priority-high",
  Medium: "bg-priority-medium",
  Low: "bg-priority-low",
};
