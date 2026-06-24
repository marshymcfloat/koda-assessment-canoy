"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { PROJECTS_TAG } from "./data";
import {
  parseProject,
  readProjectForm,
  type FieldErrors,
  type ProjectFormState,
  type ProjectFormValues,
} from "./schema";
import { insert, remove, update } from "./store";
import type { Project } from "./types";

/**
 * Server Actions = the only mutation surface. Each validates with the shared
 * Zod schema (never trusting the client), mutates the store, then calls
 * `updateTag('projects')` to immediately expire the cached read so the next
 * render shows the user's own write.
 *
 * Two shapes per mutation:
 * - `createProject` / `updateProject` take `FormData` and `redirect('/')` on
 *   success. They back the form's native `action`, so create/edit still work
 *   with JavaScript disabled (and the redirect closes the modal).
 * - `saveNewProject` / `saveProject` take parsed values and *return* a
 *   `MutationResult`. The client form calls these for the optimistic path: it
 *   dispatches the optimistic overlay, navigates immediately, then reconciles
 *   (or rolls back) from the returned result.
 *
 * Expected validation problems are returned as values, never thrown.
 */

export type MutationResult =
  | { ok: true; project: Project }
  | { ok: false; message?: string; errors?: FieldErrors };

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const values = readProjectForm(formData);
  const parsed = parseProject(values);
  if (!parsed.ok) {
    return { status: "error", errors: parsed.errors, values };
  }

  await insert(parsed.data);
  updateTag(PROJECTS_TAG);
  redirect("/");
}

export async function updateProject(
  id: number,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const values = readProjectForm(formData);
  const parsed = parseProject(values);
  if (!parsed.ok) {
    return { status: "error", errors: parsed.errors, values };
  }

  const updated = await update(id, parsed.data);
  if (!updated) {
    return {
      status: "error",
      errors: { form: "This project no longer exists." },
      values,
    };
  }

  updateTag(PROJECTS_TAG);
  redirect("/");
}

/**
 * Optimistic-path mutations. Validate authoritatively (never trust the client),
 * mutate, expire the cache, and return the persisted project so the client can
 * reconcile its optimistic overlay against a real id.
 */
export async function saveNewProject(
  values: ProjectFormValues,
): Promise<MutationResult> {
  const parsed = parseProject(values);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const project = await insert(parsed.data);
  updateTag(PROJECTS_TAG);
  return { ok: true, project };
}

export async function saveProject(
  id: number,
  values: ProjectFormValues,
): Promise<MutationResult> {
  const parsed = parseProject(values);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const project = await update(id, parsed.data);
  if (!project) return { ok: false, message: "This project no longer exists." };

  updateTag(PROJECTS_TAG);
  return { ok: true, project };
}

/**
 * Manual refresh. Expires the cached project list (`updateTag`) so the next
 * read fetches fresh data, then `refresh()`es the client router to re-render
 * the current view. Used by the dashboard's refresh button.
 */
export async function refreshProjects(): Promise<void> {
  updateTag(PROJECTS_TAG);
  refresh();
}

export type DeleteResult = { ok: boolean; message?: string };

export async function deleteProject(id: number): Promise<DeleteResult> {
  const deleted = await remove(id);
  if (!deleted) {
    return { ok: false, message: "Project not found." };
  }
  updateTag(PROJECTS_TAG);
  return { ok: true };
}
