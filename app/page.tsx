import { Suspense } from "react";
import { ProjectsPanel } from "@/components/projects/projects-panel";
import { ProjectList } from "@/components/projects/project-list";
import { SummaryStrip } from "@/components/projects/summary-strip";
import {
  ProjectListSkeleton,
  SummarySkeleton,
} from "@/components/projects/skeletons";
import { parseProjectQuery } from "@/lib/projects/query";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Dashboard. The page body is synchronous so the static shell (header, intro,
 * toolbar, skeletons) ships immediately. The two data sections each stream
 * under their own <Suspense>: the list reads `searchParams` (runtime) and is
 * therefore dynamic; the summary reads only cached data.
 */
export default function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-2">
        <p className="eyebrow flex items-center gap-2">
          <span aria-hidden className="h-px w-6 bg-primary/50" />
          Agency Workspace
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Track every client engagement — status, priority and delivery dates in
          one place.
        </p>
      </div>

      <Suspense fallback={<SummarySkeleton />}>
        <SummaryStrip />
      </Suspense>

      <ProjectsPanel>
        <Suspense fallback={<ProjectListSkeleton />}>
          <ProjectSection searchParams={searchParams} />
        </Suspense>
      </ProjectsPanel>
    </div>
  );
}

/** Isolates `searchParams` access so the rest of the page stays static. */
async function ProjectSection({ searchParams }: { searchParams: SearchParams }) {
  const query = parseProjectQuery(await searchParams);
  return <ProjectList query={query} />;
}
