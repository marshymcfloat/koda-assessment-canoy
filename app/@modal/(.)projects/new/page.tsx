import { RouteModal } from "@/components/ui/route-modal";
import { ProjectForm } from "@/components/projects/project-form";

/**
 * Intercepts /projects/new during in-app navigation and shows the create form
 * in a modal over the dashboard. A hard load of /projects/new renders the full
 * page instead.
 */
export default function NewProjectModal() {
  return (
    <RouteModal
      title="New project"
      description="Add a client engagement to the tracker."
    >
      <ProjectForm mode="create" />
    </RouteModal>
  );
}
