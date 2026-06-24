import Link from "next/link";
import { FolderPlus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Distinguishes a genuinely empty dataset (offer to create) from an active
 * filter that matched nothing (offer to clear) — these are different user
 * situations and deserve different guidance.
 */
export function EmptyState({ filtering }: { filtering: boolean }) {
  const Icon = filtering ? SearchX : FolderPlus;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold">
          {filtering ? "No matching projects" : "No projects yet"}
        </h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {filtering
            ? "Try adjusting your search or clearing the active filters."
            : "Create your first client project to start tracking status, priority and timelines."}
        </p>
      </div>
      {filtering ? (
        <Button asChild variant="outline" className="cursor-pointer">
          <Link href="/">Clear filters</Link>
        </Button>
      ) : (
        <Button asChild className="cursor-pointer">
          <Link href="/projects/new">Create project</Link>
        </Button>
      )}
    </div>
  );
}
