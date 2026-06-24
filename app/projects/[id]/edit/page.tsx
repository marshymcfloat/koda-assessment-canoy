import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/projects/project-form";
import { FormSkeleton } from "@/components/projects/skeletons";
import { getProject } from "@/lib/projects/data";

type Params = Promise<{ id: string }>;

/**
 * Full-page edit route. `params` is runtime data, so the fetching component is
 * isolated under <Suspense> (Cache Components requirement). In-app this URL is
 * intercepted into a modal instead.
 */
export default function EditProjectPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Edit project
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the details of this engagement.
          </p>
        </div>
        <Suspense fallback={<FormSkeleton />}>
          <EditFormLoader params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function EditFormLoader({ params }: { params: Params }) {
  const { id } = await params;
  const project = await getProject(Number(id));
  if (!project) notFound();
  return <ProjectForm mode="edit" project={project} />;
}
