"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProjectDialog } from "./delete-project-button";
import { useProjectStore } from "./projects-store";

/**
 * Per-project actions surfaced behind an ellipsis menu in the card's top-right
 * corner: edit (navigates) and delete (opens a confirm dialog). The dialog is
 * controlled here so the menu can dismiss before it opens.
 *
 * While a project's create/edit is still being confirmed by the server its id
 * isn't final, so editing/deleting it would race or target a phantom row — the
 * menu is disabled until the optimistic mutation reconciles.
 */
export function ProjectActions({
  id,
  projectName,
}: {
  id: number;
  projectName: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isPending } = useProjectStore();
  const pending = isPending(id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={
              pending
                ? `${projectName} is saving`
                : `Actions for ${projectName}`
            }
            className="cursor-pointer text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`/projects/${id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProjectDialog
        id={id}
        projectName={projectName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
