import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { findAll, findById } from "./store";
import type { Priority, Project, Status } from "./types";
import { PRIORITIES, STATUSES } from "./types";

/**
 * Cached read layer (Cache Components).
 *
 * `getProjects` is tagged `projects`; mutations call `updateTag('projects')`
 * (see actions.ts) for immediate read-your-own-writes. `cacheLife('minutes')`
 * bounds staleness. The list page filters/sorts the cached result in memory
 * (see query.ts), so a single cache entry backs every search/filter/sort view.
 */
export const PROJECTS_TAG = "projects";

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag(PROJECTS_TAG);
  cacheLife("minutes");
  return findAll();
}

export async function getProject(id: number): Promise<Project | undefined> {
  "use cache";
  cacheTag(PROJECTS_TAG);
  cacheLife("minutes");
  return findById(id);
}

export type StatusSummary = {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  overdue: number;
};

/** Dashboard summary counts, derived from the cached project list. */
export async function getSummary(): Promise<StatusSummary> {
  const projects = await getProjects();
  // `overdue` depends on the current date, which is non-deterministic. Defer to
  // request time so the summary streams (under <Suspense>) instead of being
  // (incorrectly) prerendered into the static shell.
  await connection();
  const today = new Date().toISOString().slice(0, 10);

  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, 0]),
  ) as Record<Status, number>;
  const byPriority = Object.fromEntries(
    PRIORITIES.map((p) => [p, 0]),
  ) as Record<Priority, number>;
  let overdue = 0;

  for (const p of projects) {
    byStatus[p.status]++;
    byPriority[p.priority]++;
    if (p.status !== "Completed" && p.dueDate < today) overdue++;
  }

  return { total: projects.length, byStatus, byPriority, overdue };
}
