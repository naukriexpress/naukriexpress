import { queryJobs } from "@/lib/db";
import JobCard from "@/components/JobCard";

export const dynamic = "force-dynamic";

export default async function ApprenticePage() {
  const { results: jobs } = await queryJobs({
    jobType: ["apprenticeship"],
    sort: "latest",
    pageSize: 100,
  });

  return (
    <main className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          Latest Apprentice Recruitment
        </h1>
        <p className="mt-1 text-sm text-ink-700/70">
          Apprentice vacancies, trade-wise positions and online application links.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl2 border border-ink-900/10 bg-white p-6 text-ink-700 shadow-card">
          <h2 className="text-lg font-semibold text-ink-900">
            No Apprentice Recruitment Available
          </h2>
          <p className="mt-2 text-sm">
            Published Apprentice recruitments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}
