import { describe, expect, it } from "vitest";
import {
  applyProjectQuery,
  defaultQuery,
  isFiltering,
  PAGE_SIZE,
  parseProjectQuery,
  type ProjectQuery,
} from "./query";
import type { Project } from "./types";

const projects: Project[] = [
  {
    id: 1,
    clientName: "Acme",
    projectName: "Website",
    description: "marketing site",
    status: "In Progress",
    priority: "High",
    startDate: "2026-06-01",
    dueDate: "2026-07-15",
  },
  {
    id: 2,
    clientName: "GreenLeaf",
    projectName: "Ordering",
    description: "online ordering",
    status: "Planning",
    priority: "Medium",
    startDate: "2026-06-10",
    dueDate: "2026-08-01",
  },
  {
    id: 3,
    clientName: "Bright Realty",
    projectName: "Portal",
    description: "listings",
    status: "Completed",
    priority: "Low",
    startDate: "2026-05-15",
    dueDate: "2026-06-30",
  },
];

const q = (overrides: Partial<ProjectQuery> = {}): ProjectQuery => ({
  ...defaultQuery,
  ...overrides,
});

describe("parseProjectQuery", () => {
  it("falls back to defaults for missing/invalid params", () => {
    expect(parseProjectQuery({ status: "Nope", sort: "bad" })).toEqual(
      defaultQuery,
    );
  });

  it("reads valid params", () => {
    expect(
      parseProjectQuery({
        q: " portal ",
        status: "Planning",
        priority: "High",
        sort: "projectName",
        dir: "desc",
      }),
    ).toEqual({
      search: "portal",
      status: "Planning",
      priority: "High",
      sort: "projectName",
      dir: "desc",
      limit: PAGE_SIZE,
    });
  });

  it("parses the `show` param into a page-aligned limit", () => {
    expect(parseProjectQuery({ show: String(PAGE_SIZE * 2) }).limit).toBe(
      PAGE_SIZE * 2,
    );
    // Rounds a partial page up to a whole page.
    expect(parseProjectQuery({ show: String(PAGE_SIZE + 1) }).limit).toBe(
      PAGE_SIZE * 2,
    );
    // Bad / too-small values fall back to one page.
    expect(parseProjectQuery({ show: "nope" }).limit).toBe(PAGE_SIZE);
    expect(parseProjectQuery({ show: "-5" }).limit).toBe(PAGE_SIZE);
  });
});

describe("applyProjectQuery", () => {
  it("searches across client, project and description", () => {
    expect(applyProjectQuery(projects, q({ search: "ordering" }))).toHaveLength(
      1,
    );
    expect(applyProjectQuery(projects, q({ search: "acme" }))[0].id).toBe(1);
  });

  it("filters by status and priority", () => {
    expect(applyProjectQuery(projects, q({ status: "Completed" }))).toHaveLength(
      1,
    );
    const high = applyProjectQuery(projects, q({ priority: "High" }));
    expect(high.map((p) => p.id)).toEqual([1]);
  });

  it("default sort groups by status (active first), then due date", () => {
    // Default query sorts by status: Planning/In Progress/On Hold ahead of
    // Completed, with due date as the secondary key.
    const sorted = applyProjectQuery(projects, defaultQuery);
    expect(sorted.map((p) => p.status)).toEqual([
      "Planning",
      "In Progress",
      "Completed",
    ]);
    // Completed (id 3) sorts last despite having the earliest due date.
    expect(sorted[sorted.length - 1].id).toBe(3);
  });

  it("sorts by due date ascending and descending", () => {
    const asc = applyProjectQuery(projects, q({ sort: "dueDate", dir: "asc" }));
    expect(asc.map((p) => p.id)).toEqual([3, 1, 2]);
    const desc = applyProjectQuery(projects, q({ sort: "dueDate", dir: "desc" }));
    expect(desc.map((p) => p.id)).toEqual([2, 1, 3]);
  });

  it("sorts by project name", () => {
    const byName = applyProjectQuery(
      projects,
      q({ sort: "projectName", dir: "asc" }),
    );
    expect(byName.map((p) => p.projectName)).toEqual([
      "Ordering",
      "Portal",
      "Website",
    ]);
  });

  it("breaks ties deterministically by name/client/id", () => {
    // Two projects share a due date; order must be stable (by project name),
    // not dependent on input/store order.
    const tied: Project[] = [
      { ...projects[0], id: 10, projectName: "Zephyr", dueDate: "2026-07-15" },
      { ...projects[0], id: 11, projectName: "Atlas", dueDate: "2026-07-15" },
    ];
    const asc = applyProjectQuery(tied, q({ sort: "dueDate", dir: "asc" }));
    expect(asc.map((p) => p.id)).toEqual([11, 10]);
    // Tiebreaker stays ascending even when the primary direction is descending.
    const desc = applyProjectQuery(tied, q({ sort: "dueDate", dir: "desc" }));
    expect(desc.map((p) => p.id)).toEqual([11, 10]);
  });

  it("does not mutate the input array", () => {
    const copy = [...projects];
    applyProjectQuery(projects, q({ sort: "projectName" }));
    expect(projects).toEqual(copy);
  });
});

describe("isFiltering", () => {
  it("is false for the default query and true when a filter is set", () => {
    expect(isFiltering(defaultQuery)).toBe(false);
    expect(isFiltering(q({ search: "x" }))).toBe(true);
    expect(isFiltering(q({ status: "Planning" }))).toBe(true);
  });
});
