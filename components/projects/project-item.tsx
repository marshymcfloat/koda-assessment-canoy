import { cn } from "@/lib/utils";
import type { Project } from "@/lib/projects/types";
import { StatusBadge } from "./status-badge";
import { PriorityBadge, PRIORITY_BAR } from "./priority-badge";
import { DueDate } from "./due-date";
import { ProjectActions } from "./project-actions";

/**
 * One project. A single responsive component (no row/card duplication): a
 * priority-colored accent bar on the left, stacked content that reflows from a
 * column on mobile to an aligned row on larger screens.
 */
export function ProjectItem({ project }: { project: Project }) {
  return (
    <li className="group relative flex overflow-hidden rounded-xl border border-border bg-card shadow-card transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-px hover:border-primary/25 hover:shadow-card-hover">
      <span
        aria-hidden
        className={cn(
          "w-1 shrink-0 transition-[width] duration-200 group-hover:w-1.5",
          PRIORITY_BAR[project.priority],
        )}
      />

      <div className="flex flex-1 flex-col gap-3 p-4 pr-12 sm:flex-row sm:items-center sm:gap-4 sm:p-5 sm:pr-14">
        {/* Title block */}
        <div className="min-w-0 flex-1">
          <p className="eyebrow truncate">{project.clientName}</p>
          <h3 className="mt-1 truncate font-display text-[17px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {project.projectName}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>

        {/* Meta block */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:w-[20rem] sm:shrink-0 sm:flex-col sm:items-start sm:gap-2">
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          <DueDate dueDate={project.dueDate} status={project.status} />
        </div>

      </div>

      {/* Actions */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <ProjectActions id={project.id} projectName={project.projectName} />
      </div>
    </li>
  );
}
