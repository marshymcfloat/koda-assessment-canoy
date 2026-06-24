/**
 * Domain types for the Client Project Tracker.
 *
 * The allowed Status / Priority values are declared once here as readonly
 * tuples so they can drive: the TypeScript union types, the Zod schema
 * (runtime validation), and the UI (badges, filters, selects) — a single
 * source of truth.
 */

export const STATUSES = [
  "Planning",
  "In Progress",
  "On Hold",
  "Completed",
] as const;

export const PRIORITIES = ["Low", "Medium", "High"] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export interface Project {
  id: number;
  clientName: string;
  projectName: string;
  description: string;
  status: Status;
  priority: Priority;
  /** ISO date string (yyyy-mm-dd). */
  startDate: string;
  /** ISO date string (yyyy-mm-dd). */
  dueDate: string;
}

/** Fields a user can submit; `id` is assigned by the store. */
export type ProjectInput = Omit<Project, "id">;
