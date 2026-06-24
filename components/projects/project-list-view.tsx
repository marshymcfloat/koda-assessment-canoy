"use client";

import { useEffect } from "react";
import {
  applyProjectQuery,
  isFiltering,
  PAGE_SIZE,
  type ProjectQuery,
} from "@/lib/projects/query";
import type { Project } from "@/lib/projects/types";
import { useProjectStore } from "./projects-store";
import { ProjectItem } from "./project-item";
import { LoadMore } from "./load-more";
import { EmptyState } from "./empty-state";

/**
 * Renders the project list from the server snapshot with any pending optimistic
 * mutations applied on top (see projects-store.tsx). Filtering / sorting /
 * pagination still run through the pure `applyProjectQuery` against the merged
 * list, and the URL-derived `query` keeps every view shareable.
 *
 * The server snapshot is authoritative: when it changes (after a mutation
 * re-renders the server list), `reconcile` drops overlays it already reflects.
 */
export function ProjectListView({
  serverProjects,
  query,
}: {
  serverProjects: Project[];
  query: ProjectQuery;
}) {
  const { apply, reconcile } = useProjectStore();

  useEffect(() => {
    reconcile(serverProjects);
  }, [serverProjects, reconcile]);

  const all = apply(serverProjects);
  const projects = applyProjectQuery(all, query);

  if (projects.length === 0) {
    return <EmptyState filtering={isFiltering(query)} />;
  }

  const visible = projects.slice(0, query.limit);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {projects.length} {projects.length === 1 ? "project" : "projects"}
        {isFiltering(query) ? ` of ${all.length}` : ""}
      </p>
      <ul className="stagger space-y-3">
        {visible.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </ul>
      {visible.length < projects.length && (
        <LoadMore
          shown={visible.length}
          total={projects.length}
          step={PAGE_SIZE}
        />
      )}
    </div>
  );
}
