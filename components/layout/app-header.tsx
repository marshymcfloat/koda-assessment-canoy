import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Global header. The "New project" link points at the real `/projects/new`
 * route; in-app navigation is intercepted into a modal, while a hard load of
 * that URL renders the full page (see app/@modal + app/projects/new).
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      {/* Hairline accent rule along the bottom edge — a small editorial signature. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden
            className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 font-display text-sm font-bold text-primary-foreground shadow-card ring-1 ring-inset ring-white/15 transition-transform duration-200 group-hover:-rotate-3"
          >
            A
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-semibold tracking-tight">
              Atlas
            </span>
            <span className="eyebrow mt-1 text-[10px]">Project Tracker</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild size="sm" className="cursor-pointer gap-1.5">
            <Link href="/projects/new">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New project</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
