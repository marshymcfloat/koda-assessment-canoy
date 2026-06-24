"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In a real app this would go to an error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          We couldn’t load your projects. Please try again.
        </p>
      </div>
      <Button onClick={() => unstable_retry()} className="cursor-pointer">
        Try again
      </Button>
    </div>
  );
}
