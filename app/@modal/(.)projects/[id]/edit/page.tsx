import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RouteModal } from "@/components/ui/route-modal";
import { ProjectForm } from "@/components/projects/project-form";
import { FormSkeleton } from "@/components/projects/skeletons";
import { getProject } from "@/lib/projects/data";

type Params = Promise<{ id: string }>;

/**
 * Intercepts /projects/[id]/edit in-app and shows the edit form in a modal.
 * `params` access is isolated under <Suspense> per Cache Components rules.
 */
export default function EditProjectModal({ params }: { params: Params }) {
  return (
    <RouteModal
      title="Edit project"
      description="Update the details of this engagement."
    >
      <Suspense fallback={<FormSkeleton />}>
        <EditFormLoader params={params} />
      </Suspense>
    </RouteModal>
  );
}

async function EditFormLoader({ params }: { params: Params }) {
  const { id } = await params;
  const project = await getProject(Number(id));
  if (!project) notFound();
  return <ProjectForm mode="edit" project={project} />;
}
