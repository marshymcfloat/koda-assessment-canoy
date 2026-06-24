import { getProjects } from "@/lib/projects/data";
import type { ProjectQuery } from "@/lib/projects/query";
import { ProjectListView } from "./project-list-view";

/**
 * Server Component. Reads the cached project list and hands it to the client
 * <ProjectListView>, which applies the URL-derived query (filter/sort/paginate)
 * plus any pending optimistic mutations. Because `query` originates from
 * `searchParams` (runtime data), this component is dynamic and is rendered
 * inside a <Suspense> boundary on the page — so it streams while the static
 * shell ships immediately.
 */
export async function ProjectList({ query }: { query: ProjectQuery }) {
  const all = await getProjects();
  return <ProjectListView serverProjects={all} query={query} />;
}
