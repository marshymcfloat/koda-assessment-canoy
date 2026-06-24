import { Skeleton } from "@/components/ui/skeleton";

/** Suspense fallback for the streamed summary strip. */
export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card max-sm:aspect-square">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-12 w-16" />
        <Skeleton className="mt-3 h-3 w-24" />
      </div>
      <div className="order-last col-span-2 rounded-xl border border-border bg-card p-5 shadow-card lg:order-0 lg:col-span-2">
        <Skeleton className="h-3 w-16" />
        <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-card max-sm:aspect-square">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-12 w-12" />
        <Skeleton className="mt-3 h-3 w-20" />
      </div>
    </div>
  );
}

/** Suspense fallback for the edit form while the project is fetched. */
export function FormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <Skeleton className="h-24" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

/** Suspense fallback for the streamed project list. */
export function ProjectListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <ul className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <li
            key={i}
            className="flex overflow-hidden rounded-xl border border-border bg-card shadow-card"
          >
            <Skeleton className="h-auto w-1 rounded-none" />
            <div className="flex flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <div className="space-y-2 sm:w-[20rem]">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
