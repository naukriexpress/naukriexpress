import JobCard from "./JobCard";
import { queryJobs } from "@/lib/db";
import type { JobType } from "@/lib/types";

export default async function TypeListingPage({
  type,
  title,
  description,
  page = 1,
  basePath,
}: {
  type: JobType;
  title: string;
  description: string;
  page?: number;
  basePath: string;
}) {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const { results, total } = await queryJobs({ jobType: [type], page: safePage, pageSize: 12 });
  const pages = Math.max(1, Math.ceil(total / 12));

  return (
    <main className="container-page py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900">{title}</h1>
      <p className="mt-2 text-ink-700">{description}</p>
      <p className="mt-2 text-sm text-ink-700/70">{total} active updates</p>
      {results.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <p className="mt-8 rounded-xl2 border border-ink-900/10 bg-white p-6 text-ink-700">No active updates yet. Check back soon.</p>
      )}
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex gap-4 text-sm font-semibold text-brand-700">
          {safePage > 1 && <a href={`${basePath}?page=${safePage - 1}`}>← Previous</a>}
          <span className="text-ink-700">Page {safePage} of {pages}</span>
          {safePage < pages && <a href={`${basePath}?page=${safePage + 1}`}>Next →</a>}
        </nav>
      )}
    </main>
  );
}
