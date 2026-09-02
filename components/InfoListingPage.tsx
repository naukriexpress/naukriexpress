import { getAllJobsRaw } from "@/lib/db";
import Link from "next/link";

export default async function InfoListingPage({
  title,
  description,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaLabel: string;
}) {
  const allJobs = await getAllJobsRaw();
  const jobs = allJobs.filter((j) => j.status === "published").slice(0, 8);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">{description}</p>

      <div className="mt-8 divide-y divide-ink-900/10 rounded-xl2 border border-ink-900/10 bg-white">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-50/50 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-medium text-ink-900 truncate">{job.title}</p>
              <p className="text-xs text-ink-700/60">{job.organization}</p>
            </div>
            <span className="shrink-0 rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700">
              {ctaLabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
