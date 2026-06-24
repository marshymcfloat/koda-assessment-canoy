"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * "Load more" control for the project list. Pagination is URL-driven (the
 * `show` param) so the view stays shareable and the server re-renders with more
 * rows. The list grows in place — React appends the new <ProjectItem>s rather
 * than swapping the whole list — so there's no skeleton flash; a local
 * transition just spins the button while the server streams.
 */
export function LoadMore({
  shown,
  total,
  step,
}: {
  shown: number;
  total: number;
  step: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const remaining = total - shown;

  const loadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("show", String(shown + step));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col items-center gap-1.5 pt-1">
      <Button
        variant="outline"
        className="cursor-pointer gap-1.5"
        onClick={loadMore}
      >
        Load more
      </Button>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {shown} of {total} — {Math.min(step, remaining)} more
      </p>
    </div>
  );
}
