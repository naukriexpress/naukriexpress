import type { Metadata } from "next";
import Link from "next/link";
import { getAllJobsRaw } from "@/lib/db";
import { deleteJobAction, toggleExpiredAction, toggleFeaturedAction } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Jobs", robots: { index: false, follow: false } };

function statusPill(status: string) {
  const map: Record<string, string> = {
    published: "bg-leaf-50 text-leaf-600",
    draft: "bg-ink-900/5 text-ink-700",
    scheduled: "bg-brand-50 text-brand-700",
    expired: "bg-red-50 text-red-600",
  };
  return map[status] || "bg-ink-900/5 text-ink-700";
}

export default async function ManageJobsPage({
  searchParams,
}: {
  searchParams: { created?: string; updated?: string };
}) {
  const allJobs = await getAllJobsRaw();
  const jobs = allJobs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Manage Jobs</h1>
          <p className="text-sm text-ink-700/70 mt-1">{jobs.length} total job postings</p>
        </div>
        <Link href="/admin/jobs/new" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + Add New Job
        </Link>
      </div>

      {(searchParams.created || searchParams.updated) && (
        <div className="mb-4 rounded-lg bg-leaf-50 px-4 py-2.5 text-sm font-medium text-leaf-600">
          {searchParams.created ? "Job published successfully." : "Job updated successfully."}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl2 border border-ink-900/10 bg-white shadow-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 bg-ink-900/[0.02] text-left text-xs uppercase tracking-wide text-ink-700/60">
              <th className="px-4 py-3 font-semibold">Job Title</th>
              <th className="px-4 py-3 font-semibold">Organization</th>
              <th className="px-4 py-3 font-semibold">Last Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-ink-900/5 last:border-0">
                <td className="px-4 py-3 max-w-[260px]">
                  <p className="font-medium text-ink-900 truncate">{job.title}</p>
                  {job.featured && <span className="text-[11px] font-semibold text-saffron-600">★ Featured</span>}
                </td>
                <td className="px-4 py-3 text-ink-700 max-w-[180px] truncate">{job.organization}</td>
                <td className="px-4 py-3 text-ink-700 whitespace-nowrap">
                  {new Date(job.dates.lastDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${statusPill(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-700">{job.views}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    <Link href={`/jobs/${job.slug}`} target="_blank" className="rounded-md border border-ink-900/15 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-900/5">
                      View
                    </Link>
                    <Link href={`/admin/jobs/${job.id}/edit`} className="rounded-md border border-brand-600 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50">
                      Edit
                    </Link>
                    <form action={toggleFeaturedAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="rounded-md border border-saffron-500 px-2.5 py-1.5 text-xs font-medium text-saffron-600 hover:bg-saffron-50">
                        {job.featured ? "Unfeature" : "Feature"}
                      </button>
                    </form>
                    <form action={toggleExpiredAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="rounded-md border border-ink-900/15 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-900/5">
                        {job.status === "expired" ? "Reopen" : "Mark Expired"}
                      </button>
                    </form>
                    <form action={deleteJobAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="rounded-md border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
