import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobById } from "@/lib/db";
import { updateJobAction } from "@/lib/actions";
import JobForm from "@/components/JobForm";

export const metadata: Metadata = { title: "Edit Job", robots: { index: false, follow: false } };

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  if (!job) notFound();

  const boundAction = updateJobAction.bind(null, job.id);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink-900">Edit Job</h1>
        <p className="text-sm text-ink-700/70 mt-1">{job.title}</p>
      </div>
      <JobForm action={boundAction} job={job} submitLabel="Save Changes" />
    </div>
  );
}
