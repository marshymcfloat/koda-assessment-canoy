import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">Project not found</h2>
        <p className="text-sm text-muted-foreground">
          This project may have been deleted.
        </p>
      </div>
      <Button asChild className="cursor-pointer">
        <Link href="/">Back to projects</Link>
      </Button>
    </div>
  );
}
