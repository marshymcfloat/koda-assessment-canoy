/**
 * Pure date/formatting helpers. No framework deps → unit-testable.
 *
 * Dates are stored as `yyyy-mm-dd` strings. We parse them as UTC noon to avoid
 * timezone off-by-one errors when formatting.
 */

function toDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** "01 Jul 2026" — compact, locale-stable. */
export function formatDate(iso: string): string {
  if (!iso) return "—";
  return toDate(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const MS_PER_DAY = 86_400_000;

/** Whole-day difference between an ISO date and `now` (negative = past). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = toDate(iso).getTime();
  const today = toDate(now.toISOString().slice(0, 10)).getTime();
  return Math.round((target - today) / MS_PER_DAY);
}

/** A due date is overdue when in the past and the project isn't completed. */
export function isOverdue(
  dueDate: string,
  completed: boolean,
  now: Date = new Date(),
): boolean {
  if (completed) return false;
  return daysUntil(dueDate, now) < 0;
}

/** Human relative label: "Today", "in 3 days", "5 days overdue". */
export function formatRelativeDue(iso: string, now: Date = new Date()): string {
  const days = daysUntil(iso, now);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `in ${days} days`;
}
