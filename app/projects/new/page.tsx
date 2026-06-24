import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/projects/project-form";

/**
 * Full-page create route. Reached on a hard load / no-JS; in-app the same URL
 * is intercepted into a modal (see app/@modal/(.)projects/new).
 */
export default function NewProjectPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            New project
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a client engagement to the tracker.
          </p>
        </div>
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
