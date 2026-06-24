import {
  ProjectListSkeleton,
  SummarySkeleton,
} from "@/components/projects/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI shown during navigation to the dashboard. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <SummarySkeleton />
      <div className="space-y-5">
        <Skeleton className="h-10 w-full" />
        <ProjectListSkeleton />
      </div>
    </div>
  );
}
