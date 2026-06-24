"use client";

import { useTransition, type ReactNode } from "react";
import { Toolbar } from "./toolbar";
import { ProjectListSkeleton } from "./skeletons";
import { refreshProjects } from "@/lib/projects/actions";

/**
 * Client shell around the toolbar and the streamed list. Owns a transition so
 * every filter/sort change (and the manual refresh) flips `isPending` while the
 * server re-renders — we swap in a skeleton during that window so the UI feels
 * responsive instead of freezing on stale rows. `children` is the server-
 * rendered <ProjectList> (inside its own <Suspense> for the initial load).
 */
export function ProjectsPanel({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshProjects();
    });
  };

  return (
    <div className="space-y-5">
      <Toolbar
        startTransition={startTransition}
        onRefresh={handleRefresh}
        isPending={isPending}
      />
      {isPending ? <ProjectListSkeleton /> : children}
    </div>
  );
}
