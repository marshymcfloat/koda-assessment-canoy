import { connection } from "next/server";
import { RouteModal } from "@/components/ui/route-modal";
import { ProjectForm } from "@/components/projects/project-form";

/**
 * Intercepts /projects/new during in-app navigation and shows the create form
 * in a modal over the dashboard. A hard load of /projects/new renders the full
 * page instead.
 *
 * `await connection()` opts this route out of static prerendering. A statically
 * prerendered intercepting route is served from Vercel's CDN without the
 * interception context, so soft navigation falls through to the full page
 * instead of the modal. (`export const dynamic` isn't allowed under Cache
 * Components, so `connection()` is the supported way to force dynamic.)
 */
export default async function NewProjectModal() {
  await connection();
  return (
    <RouteModal
      title="New project"
      description="Add a client engagement to the tracker."
    >
      <ProjectForm mode="create" />
    </RouteModal>
  );
}
