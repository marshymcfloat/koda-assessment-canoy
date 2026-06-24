import "server-only";
import seed from "@/test_data.json";
import type { Project, ProjectInput } from "./types";

/**
 * In-memory data store (the assessment provides no backend).
 *
 * `test_data.json` is the seed source. We deep-clone it into a module-level
 * array so mutations never touch the fixture on disk. As a module singleton it
 * persists across requests during a running server, but resets on restart —
 * an intentional, documented trade-off for an assessment without a database.
 *
 * `server-only` guarantees this file can never be imported into a Client
 * Component bundle.
 */
const projects: Project[] = structuredClone(seed) as Project[];

let nextId = Math.max(0, ...projects.map((p) => p.id)) + 1;

/** Simulate network/database latency so loading + Suspense states are visible. */
const LATENCY_MS = 350;
function delay(ms = LATENCY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function findAll(): Promise<Project[]> {
  await delay();
  // Return copies so callers cannot mutate store state by reference.
  return projects.map((p) => ({ ...p }));
}

export async function findById(id: number): Promise<Project | undefined> {
  await delay();
  const found = projects.find((p) => p.id === id);
  return found ? { ...found } : undefined;
}

export async function insert(input: ProjectInput): Promise<Project> {
  await delay();
  const project: Project = { id: nextId++, ...input };
  projects.unshift(project);
  return { ...project };
}

export async function update(
  id: number,
  input: ProjectInput,
): Promise<Project | undefined> {
  await delay();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  projects[index] = { ...projects[index], ...input, id };
  return { ...projects[index] };
}

export async function remove(id: number): Promise<boolean> {
  await delay();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return false;
  projects.splice(index, 1);
  return true;
}
