"use client";

import { useActionState, useContext, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createProject, updateProject } from "@/lib/projects/actions";
import {
  initialFormState,
  parseProject,
  readProjectForm,
  type FieldErrors,
} from "@/lib/projects/schema";
import { PRIORITIES, STATUSES, type Project } from "@/lib/projects/types";
import { RouteModalContext } from "@/components/ui/route-modal";
import { useProjectStore } from "./projects-store";

type Props =
  | { mode: "create"; project?: undefined; onDone?: () => void }
  | { mode: "edit"; project: Project; onDone?: () => void };

/**
 * Shared create/edit form, progressively enhanced.
 *
 * Without JavaScript the native `action` posts to the redirecting Server Action
 * (`createProject` / `updateProject`) which validates authoritatively and
 * `redirect('/')`s; errors come back through `useActionState`.
 *
 * With JavaScript, `onSubmit` takes over: it validates client-side (same Zod
 * schema), dispatches an optimistic overlay into the shared store, and closes
 * the modal / leaves the form route *immediately* — so the change appears at
 * once. The store confirms with the server in the background and reconciles
 * (or rolls back) on its own, since it outlives this unmounting form.
 */
export function ProjectForm({ mode, project, onDone }: Props) {
  const router = useRouter();
  const modal = useContext(RouteModalContext);
  const { commitCreate, commitUpdate } = useProjectStore();
  const action =
    mode === "edit" ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialFormState);

  // Client-validation errors (JS path) take precedence over the server-returned
  // errors (no-JS path); `null` means the JS path hasn't run yet.
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const errors: FieldErrors = clientErrors ?? state.errors ?? {};
  const v = state.values;

  // Track dates so the due-date picker can't select before the start date.
  const [startDate, setStartDate] = useState(
    v?.startDate ?? project?.startDate ?? "",
  );

  function leave() {
    // In a route modal, dismiss via history (instant); otherwise navigate home.
    if (onDone) onDone();
    else if (modal) modal.dismiss();
    else router.push("/");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readProjectForm(new FormData(event.currentTarget));
    const parsed = parseProject(values);
    if (!parsed.ok) {
      setClientErrors(parsed.errors);
      return;
    }
    setClientErrors({});

    if (mode === "edit") commitUpdate(project.id, parsed.data, values);
    else commitCreate(parsed.data, values);

    // Close synchronously — the store carries the confirmation to completion.
    leave();
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {errors.form && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.form}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Client name" error={errors.clientName} required>
          {(id) => (
            <Input
              id={id}
              name="clientName"
              defaultValue={v?.clientName ?? project?.clientName ?? ""}
              placeholder="Acme Corporation"
              aria-invalid={!!errors.clientName}
              required
            />
          )}
        </Field>

        <Field label="Project name" error={errors.projectName} required>
          {(id) => (
            <Input
              id={id}
              name="projectName"
              defaultValue={v?.projectName ?? project?.projectName ?? ""}
              placeholder="Website Redesign"
              aria-invalid={!!errors.projectName}
              required
            />
          )}
        </Field>
      </div>

      <Field label="Description" error={errors.description}>
        {(id) => (
          <Textarea
            id={id}
            name="description"
            rows={3}
            defaultValue={v?.description ?? project?.description ?? ""}
            placeholder="Short summary of the engagement…"
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Status" error={errors.status} required>
          {(id) => (
            <Select
              name="status"
              defaultValue={v?.status ?? project?.status ?? "Planning"}
            >
              <SelectTrigger id={id} className="w-full cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>

        <Field label="Priority" error={errors.priority} required>
          {(id) => (
            <Select
              name="priority"
              defaultValue={v?.priority ?? project?.priority ?? "Medium"}
            >
              <SelectTrigger id={id} className="w-full cursor-pointer">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>

        <Field label="Start date" error={errors.startDate} required>
          {(id) => (
            <Input
              id={id}
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-invalid={!!errors.startDate}
              required
            />
          )}
        </Field>

        <Field label="Due date" error={errors.dueDate} required>
          {(id) => (
            <Input
              id={id}
              name="dueDate"
              type="date"
              min={startDate || undefined}
              defaultValue={v?.dueDate ?? project?.dueDate ?? ""}
              aria-invalid={!!errors.dueDate}
              required
            />
          )}
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={leave}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="cursor-pointer gap-1.5">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "edit" ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

/** Label + control + inline error, with wired `aria-describedby`. */
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={cn(error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div aria-describedby={error ? errorId : undefined}>{children(id)}</div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
