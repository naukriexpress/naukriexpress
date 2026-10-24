import Link from "next/link";
import { queryJobs } from "@/lib/db";

export default async function RelatedJobs({
  currentJobId,
  state,
}: {
  currentJobId: string;
  state?: string;
}) {
  const { results } = await queryJobs({
    state,
    pageSize: 5,
    status: "published",
  });
  const jobs = results.filter((job) => job.id !== currentJobId).slice(0, 3);

  if (jobs.length === 0) return null;

  return (
    <section className="related-jobs-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-3 font-display text-sm font-extrabold text-ink-900">
        Related Jobs
      </h2>
      <div className="space-y-2">
        {jobs.map((job, index) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className={`related-job-link block rounded-xl border p-3 transition-colors ${index % 3 === 0 ? "related-job-link--sky" : index % 3 === 1 ? "related-job-link--emerald" : "related-job-link--violet"}`}
          >
            <p className="related-job-title line-clamp-2 text-xs font-bold text-ink-900">
              {job.title}
            </p>
            <p className="related-job-organization mt-1 line-clamp-1 text-xs text-ink-700/70">
              {job.organization}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function RelatedJobsSkeleton() {
  return (
    <section className="job-details-related-skeleton rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Loading related jobs" aria-busy="true">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl border border-slate-200 p-3">
            <div className="h-3 w-5/6 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-2/5 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
