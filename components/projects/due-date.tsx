import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeDue, isOverdue } from "@/lib/projects/format";
import type { Status } from "@/lib/projects/types";

/**
 * Due date with an absolute date plus a relative hint. Overdue (and not
 * Completed) dates are flagged in the danger color.
 */
export function DueDate({
  dueDate,
  status,
  showRelative = true,
  className,
}: {
  dueDate: string;
  status: Status;
  showRelative?: boolean;
  className?: string;
}) {
  const overdue = isOverdue(dueDate, status === "Completed");

  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <CalendarClock
        className={cn("size-3.5", overdue ? "text-destructive" : "text-muted-foreground")}
        aria-hidden
      />
      <span className="tabular text-sm text-foreground">{formatDate(dueDate)}</span>
      {showRelative && (
        <span
          className={cn(
            "text-xs",
            overdue ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          · {formatRelativeDue(dueDate)}
        </span>
      )}
    </span>
  );
}
