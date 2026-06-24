import { z } from "zod";
import { PRIORITIES, STATUSES, type ProjectInput } from "./types";

/**
 * Single Zod schema shared by the client form (instant inline validation) and
 * the server actions (authoritative validation — Server Actions are reachable
 * by direct POST, so the server must never trust the client).
 */

const dateString = z
  .string()
  .min(1, "Required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

export const projectSchema = z
  .object({
    clientName: z.string().trim().min(1, "Client name is required").max(120),
    projectName: z.string().trim().min(1, "Project name is required").max(120),
    description: z.string().trim().max(1000).optional().default(""),
    status: z.enum(STATUSES, { message: "Select a valid status" }),
    priority: z.enum(PRIORITIES, { message: "Select a valid priority" }),
    startDate: dateString,
    dueDate: dateString,
  })
  .refine(
    (data) => Date.parse(data.dueDate) >= Date.parse(data.startDate),
    {
      message: "Due date cannot be earlier than the start date",
      path: ["dueDate"],
    },
  );

export type ProjectFormValues = z.input<typeof projectSchema>;

/** Per-field error messages keyed by form field name. */
export type FieldErrors = Partial<
  Record<keyof ProjectFormValues | "form", string>
>;

/**
 * Return shape of every mutation. Modeled as a value (not a thrown error) so it
 * can be surfaced through React's `useActionState`.
 */
export type ProjectFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  /** Echo the submitted values back so the form can repopulate on error. */
  values?: ProjectFormValues;
};

export const initialFormState: ProjectFormState = { status: "idle" };

/** Read raw form values from a FormData payload (no validation yet). */
export function readProjectForm(formData: FormData): ProjectFormValues {
  return {
    clientName: String(formData.get("clientName") ?? ""),
    projectName: String(formData.get("projectName") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "") as ProjectFormValues["status"],
    priority: String(
      formData.get("priority") ?? "",
    ) as ProjectFormValues["priority"],
    startDate: String(formData.get("startDate") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  };
}

type ParseResult =
  | { ok: true; data: ProjectInput }
  | { ok: false; errors: FieldErrors };

/** Validate raw values and flatten Zod issues into per-field messages. */
export function parseProject(values: ProjectFormValues): ParseResult {
  const result = projectSchema.safeParse(values);
  if (result.success) {
    return { ok: true, data: result.data as ProjectInput };
  }

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = (issue.path[0] ?? "form") as keyof FieldErrors;
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}
