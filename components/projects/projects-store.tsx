"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveNewProject, saveProject } from "@/lib/projects/actions";
import type { ProjectFormValues } from "@/lib/projects/schema";
import type { Project, ProjectInput } from "@/lib/projects/types";

/**
 * Client-side optimistic overlay for project mutations.
 *
 * The list itself is still server-rendered (read-your-own-writes via the cache
 * tag); this store only layers *pending* mutations on top so create / edit /
 * delete feel instant despite the action round-trip. The server stays
 * authoritative: when fresh data arrives (`reconcile`), overlays the server now
 * reflects are dropped — so there is no duplicate row or flash, and a failed
 * action is rolled back.
 *
 * Lives at the layout level so the inline delete (in the list) and the
 * create/edit forms (in the parallel `@modal` slot or the full-page routes) all
 * dispatch into the same store. `commitCreate` / `commitUpdate` run the action +
 * refresh here, in the always-mounted provider, so the form's modal can close
 * synchronously on submit while the confirmation continues in the background.
 */

/**
 * An optimistic create. While `real` is null it renders with the temp `key` id
 * (and counts as "pending"). Once the action returns, `real` holds the
 * persisted project, so the row switches to its real id immediately — editable,
 * deletable, no longer pending — without waiting for the list to refresh.
 */
type CreateOverlay = { key: number; input: ProjectInput; real: Project | null };
type Rollback = () => void;

type ProjectStore = {
  /** Apply pending overlays onto a server snapshot for rendering. */
  apply: (server: Project[]) => Project[];
  /** Drop overlays the given server snapshot already reflects. */
  reconcile: (server: Project[]) => void;
  /** True while a project has an in-flight create/edit (act-on-it is blocked). */
  isPending: (id: number) => boolean;
  /** Optimistically delete; returns `rollback` for the caller to undo on failure. */
  beginDelete: (id: number) => { rollback: Rollback };
  /** Optimistically create, then confirm + refresh in the background. */
  commitCreate: (input: ProjectInput, values: ProjectFormValues) => void;
  /** Optimistically edit, then confirm + refresh in the background. */
  commitUpdate: (
    id: number,
    input: ProjectInput,
    values: ProjectFormValues,
  ) => void;
};

const ProjectStoreContext = createContext<ProjectStore | null>(null);

/** Stable, list-unique temp ids for optimistic creates (negative, never collide with real ids). */
let tempSeq = 0;
const nextTempId = () => --tempSeq;

/** Content fingerprint used to match an optimistic create/edit to a server row. */
function signature(p: ProjectInput): string {
  return [
    p.clientName,
    p.projectName,
    p.description,
    p.status,
    p.priority,
    p.startDate,
    p.dueDate,
  ].join(" ");
}

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [, startCommit] = useTransition();

  const [creates, setCreates] = useState<CreateOverlay[]>([]);
  const [updates, setUpdates] = useState<Map<number, ProjectInput>>(new Map());
  const [deletes, setDeletes] = useState<Set<number>>(new Set());

  const apply = useCallback(
    (server: Project[]): Project[] => {
      const base = server
        .filter((p) => !deletes.has(p.id))
        .map((p) => {
          const edit = updates.get(p.id);
          return edit ? { ...p, ...edit, id: p.id } : p;
        });

      // Drop an optimistic create once the server snapshot already contains it
      // (by real id once known, else by content) — avoids a duplicate row at
      // the reconcile seam. Confirmed creates render with their real id.
      const serverIds = new Set(server.map((p) => p.id));
      const serverSigs = new Set(server.map((p) => signature(p)));
      const pending = creates
        .filter((c) =>
          c.real ? !serverIds.has(c.real.id) : !serverSigs.has(signature(c.input)),
        )
        .map((c): Project => c.real ?? { id: c.key, ...c.input });

      return [...pending, ...base];
    },
    [creates, updates, deletes],
  );

  const reconcile = useCallback((server: Project[]) => {
    const ids = new Set(server.map((p) => p.id));
    const serverSigs = new Set(server.map((p) => signature(p)));

    setCreates((prev) => {
      const next = prev.filter((c) =>
        c.real ? !ids.has(c.real.id) : !serverSigs.has(signature(c.input)),
      );
      return next.length === prev.length ? prev : next;
    });

    setDeletes((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of prev) {
        if (!ids.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    setUpdates((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const [id, input] of prev) {
        const sp = server.find((p) => p.id === id);
        if (sp && signature(sp) === signature({ ...sp, ...input })) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  // Only an *unconfirmed* create (temp id) or an in-flight edit blocks acting on
  // the row; a confirmed create renders with its real id and is fully usable.
  const isPending = useCallback(
    (id: number) =>
      creates.some((c) => !c.real && c.key === id) || updates.has(id),
    [creates, updates],
  );

  const beginCreate = useCallback((input: ProjectInput) => {
    const key = nextTempId();
    setCreates((prev) => [...prev, { key, input, real: null }]);
    return {
      key,
      rollback: () => setCreates((prev) => prev.filter((c) => c.key !== key)),
      confirm: (real: Project) =>
        setCreates((prev) =>
          prev.map((c) => (c.key === key ? { ...c, real } : c)),
        ),
    };
  }, []);

  const beginUpdate = useCallback((id: number, input: ProjectInput) => {
    setUpdates((prev) => new Map(prev).set(id, input));
    return {
      rollback: () =>
        setUpdates((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        }),
    };
  }, []);

  const beginDelete = useCallback((id: number) => {
    setDeletes((prev) => new Set(prev).add(id));
    return {
      rollback: () =>
        setDeletes((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        }),
    };
  }, []);

  const commitCreate = useCallback(
    (input: ProjectInput, values: ProjectFormValues) => {
      const { rollback, confirm } = beginCreate(input);
      startCommit(async () => {
        const result = await saveNewProject(values);
        if (!result.ok) {
          rollback();
          toast.error(result.message ?? "Couldn't create the project.");
          return;
        }
        // Adopt the real id now so the row is immediately editable/deletable.
        confirm(result.project);
        toast.success(`Created “${result.project.projectName}”`);
        // Catch the summary + server snapshot up; reconcile drops the overlay.
        // The transition keeps the revealed list mounted (no skeleton flash).
        router.refresh();
      });
    },
    [beginCreate, router],
  );

  const commitUpdate = useCallback(
    (id: number, input: ProjectInput, values: ProjectFormValues) => {
      const { rollback } = beginUpdate(id, input);
      startCommit(async () => {
        const result = await saveProject(id, values);
        if (!result.ok) {
          rollback();
          toast.error(result.message ?? "Couldn't save the project.");
          return;
        }
        toast.success(`Saved “${result.project.projectName}”`);
        router.refresh();
      });
    },
    [beginUpdate, router],
  );

  const value = useMemo<ProjectStore>(
    () => ({
      apply,
      reconcile,
      isPending,
      beginDelete,
      commitCreate,
      commitUpdate,
    }),
    [apply, reconcile, isPending, beginDelete, commitCreate, commitUpdate],
  );

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore(): ProjectStore {
  const store = useContext(ProjectStoreContext);
  if (!store) {
    throw new Error("useProjectStore must be used within <ProjectStoreProvider>");
  }
  return store;
}
