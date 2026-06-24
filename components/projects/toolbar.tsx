"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionStartFunction,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, RefreshCw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITIES, STATUSES } from "@/lib/projects/types";
import { SORT_FIELDS, type SortField } from "@/lib/projects/query";

const SORT_LABELS: Record<SortField, string> = {
  status: "Status",
  dueDate: "Due date",
  startDate: "Start date",
  projectName: "Name",
};

/**
 * Search / filter / sort, all driven through the URL (`searchParams`) so the
 * server components re-render with fresh, shareable results. Search is
 * debounced; `all` clears a filter. Uses `router.replace` to avoid flooding
 * browser history.
 */
export function Toolbar({
  startTransition,
  onRefresh,
  isPending,
}: {
  startTransition: TransitionStartFunction;
  onRefresh: () => void;
  isPending: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Wrap navigation in the parent's transition so `isPending` stays true while
  // the server re-renders, which lets the panel show a skeleton meanwhile.
  const navigate = useCallback(
    (href: string) => {
      startTransition(() => router.replace(href, { scroll: false }));
    },
    [router, startTransition],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
      // Any filter/sort/search change resets pagination to the first page.
      params.delete("show");
      const qs = params.toString();
      navigate(qs ? `${pathname}?${qs}` : pathname);
    },
    [navigate, pathname, searchParams],
  );

  // Debounced search, seeded from the URL.
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if ((searchParams.get("q") ?? "") !== search) setParam("q", search);
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [search, searchParams, setParam]);

  const status = searchParams.get("status") ?? "all";
  const priority = searchParams.get("priority") ?? "all";
  const sort = (searchParams.get("sort") as SortField) ?? "status";
  const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[16rem]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects or clients…"
          aria-label="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={(v) => setParam("status", v)}>
          <SelectTrigger className="w-[9.5rem] cursor-pointer" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={(v) => setParam("priority", v)}>
          <SelectTrigger className="w-[9rem] cursor-pointer" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger className="w-[8.5rem] cursor-pointer" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_FIELDS.map((f) => (
              <SelectItem key={f} value={f}>
                {SORT_LABELS[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          aria-label={`Sort ${dir === "asc" ? "ascending" : "descending"}`}
          onClick={() => setParam("dir", dir === "asc" ? "desc" : "asc")}
        >
          <ArrowDownUp className="size-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          aria-label="Refresh projects"
          disabled={isPending}
          onClick={onRefresh}
        >
          <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
        </Button>

        {(search || status !== "all" || priority !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={() => {
              setSearch("");
              navigate(pathname);
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
