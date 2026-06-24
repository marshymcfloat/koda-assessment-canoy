"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteProject } from "@/lib/projects/actions";
import { useProjectStore } from "./projects-store";

/**
 * Confirm-then-delete. Controlled by the parent (opened from the project's
 * actions menu). Removes the row optimistically (instantly hidden), then runs
 * the `deleteProject` server action: on success it refreshes so the summary +
 * server snapshot catch up; on failure it rolls the row back and toasts.
 */
export function DeleteProjectDialog({
  id,
  projectName,
  open,
  onOpenChange,
}: {
  id: number;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { beginDelete } = useProjectStore();

  function onConfirm() {
    // Hide the row immediately and close the dialog, then confirm with the server.
    const { rollback } = beginDelete(id);
    onOpenChange(false);

    startTransition(async () => {
      const result = await deleteProject(id);
      if (result.ok) {
        toast.success(`Deleted “${projectName}”`);
        // Keep summary + server snapshot in sync; the transition prevents a
        // skeleton flash so the (already-removed) row never reappears.
        router.refresh();
      } else {
        rollback();
        toast.error(result.message ?? "Could not delete project");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            “{projectName}” will be permanently removed. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
