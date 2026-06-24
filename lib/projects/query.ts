import type { Priority, Project, Status } from "./types";
import { PRIORITIES, STATUSES } from "./types";

/**
 * Pure search / filter / sort applied to the project list.
 *
 * Kept free of Next.js APIs so it is trivially unit-testable and reusable. The
 * list page derives `ProjectQuery` from the URL `searchParams` via
 * `parseProjectQuery`, so every view is shareable and bookmarkable.
 */

export const SORT_FIELDS = [
  "status",
  "dueDate",
  "startDate",
  "projectName",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDir = "asc" | "desc";

/**
 * Workflow rank for status sorting: active work (Planning → In Progress →
 * On Hold) sorts ahead of Completed, following the declared STATUSES order.
 */
const STATUS_RANK = Object.fromEntries(
  STATUSES.map((s, i) => [s, i]),
) as Record<Status, number>;

/** How many rows the list shows before the user clicks "Load more". */
export const PAGE_SIZE = 8;

export interface ProjectQuery {
  search: string;
  status: Status | "all";
  priority: Priority | "all";
  sort: SortField;
  dir: SortDir;
  /** Max rows to render (URL `show` param); grows via "Load more". */
  limit: number;
}

export const defaultQuery: ProjectQuery = {
  search: "",
  status: "all",
  priority: "all",
  sort: "status",
  dir: "asc",
  limit: PAGE_SIZE,
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Normalize raw URL search params into a validated query (bad values ignored). */
export function parseProjectQuery(params: RawParams): ProjectQuery {
  const status = first(params.status);
  const priority = first(params.priority);
  const sort = first(params.sort);
  const dir = first(params.dir);
  const show = Number(first(params.show));

  return {
    search: (first(params.q) ?? "").trim(),
    status: STATUSES.includes(status as Status) ? (status as Status) : "all",
    priority: PRIORITIES.includes(priority as Priority)
      ? (priority as Priority)
      : "all",
    sort: SORT_FIELDS.includes(sort as SortField)
      ? (sort as SortField)
      : defaultQuery.sort,
    dir: dir === "desc" ? "desc" : "asc",
    // Round up to a whole page and never below one page; bad values → default.
    limit:
      Number.isFinite(show) && show > PAGE_SIZE
        ? Math.ceil(show / PAGE_SIZE) * PAGE_SIZE
        : PAGE_SIZE,
  };
}

export function applyProjectQuery(
  projects: Project[],
  query: ProjectQuery,
): Project[] {
  const term = query.search.toLowerCase();

  const filtered = projects.filter((p) => {
    if (query.status !== "all" && p.status !== query.status) return false;
    if (query.priority !== "all" && p.priority !== query.priority) return false;
    if (term) {
      const haystack =
        `${p.clientName} ${p.projectName} ${p.description}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const factor = query.dir === "asc" ? 1 : -1;
  return filtered.sort((a, b) => {
    const primary =
      query.sort === "status"
        ? STATUS_RANK[a.status] - STATUS_RANK[b.status]
        : a[query.sort].localeCompare(b[query.sort]);
    if (primary !== 0) return primary * factor;
    // Stable, deterministic tiebreaker so rows that share the sorted value
    // (e.g. two projects with the same status or due date) keep a sensible,
    // consistent order instead of falling back to arbitrary store order. Due
    // date leads so the default status sort reads "active first, then soonest".
    return (
      a.dueDate.localeCompare(b.dueDate) ||
      a.projectName.localeCompare(b.projectName) ||
      a.clientName.localeCompare(b.clientName) ||
      a.id - b.id
    );
  });
}

/** True when any filter/search is active (distinguishes "empty" vs "no matches"). */
export function isFiltering(query: ProjectQuery): boolean {
  return (
    query.search !== "" || query.status !== "all" || query.priority !== "all"
  );
}
