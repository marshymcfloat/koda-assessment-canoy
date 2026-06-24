import { describe, expect, it } from "vitest";
import { parseProject, type ProjectFormValues } from "./schema";

const valid: ProjectFormValues = {
  clientName: "Acme Corporation",
  projectName: "Website Redesign",
  description: "Modernize the site.",
  status: "In Progress",
  priority: "High",
  startDate: "2026-06-01",
  dueDate: "2026-07-15",
};

describe("parseProject", () => {
  it("accepts a valid project", () => {
    const result = parseProject(valid);
    expect(result.ok).toBe(true);
  });

  it("trims and requires client name", () => {
    const result = parseProject({ ...valid, clientName: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.clientName).toBeDefined();
  });

  it("requires project name", () => {
    const result = parseProject({ ...valid, projectName: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.projectName).toBeDefined();
  });

  it("rejects an invalid status", () => {
    const result = parseProject({
      ...valid,
      status: "Archived" as ProjectFormValues["status"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.status).toBeDefined();
  });

  it("rejects an invalid priority", () => {
    const result = parseProject({
      ...valid,
      priority: "Urgent" as ProjectFormValues["priority"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.priority).toBeDefined();
  });

  it("rejects a due date earlier than the start date", () => {
    const result = parseProject({
      ...valid,
      startDate: "2026-07-15",
      dueDate: "2026-06-01",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.dueDate).toBeDefined();
  });

  it("allows due date equal to start date", () => {
    const result = parseProject({
      ...valid,
      startDate: "2026-06-01",
      dueDate: "2026-06-01",
    });
    expect(result.ok).toBe(true);
  });

  it("defaults an empty description to an empty string", () => {
    const result = parseProject({ ...valid, description: "" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.description).toBe("");
  });
});
