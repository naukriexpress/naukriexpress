import type { Metadata } from "next";
import Link from "next/link";
import { queryJobs } from "@/lib/db";
import type { Category, JobFilters, JobType, Qualification } from "@/lib/types";
import JobCard from "@/components/JobCard";
import FilterPanel from "@/components/FilterPanel";

export const metadata: Metadata = {
  title: "Latest Jobs - Filter by Gender, Category, Qualification & Location",
  description:
    "Browse the latest government and private job vacancies in India. Filter by gender, category (Open/OBC/SC/ST/EWS), qualification, job type, state and last date.",
};

type SP = Record<string, string | string[] | undefined>;

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function str(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}
function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function buildFilters(searchParams: SP): JobFilters {
  const page = num(searchParams.page) || 1;
  return {
    q: str(searchParams.q),
    gender: (str(searchParams.gender) as JobFilters["gender"]) || "all",
    categories: arr(searchParams.categories) as Category[],
    qualifications: arr(searchParams.qualifications) as Qualification[],
    jobType: arr(searchParams.jobType) as JobType[],
    state: str(searchParams.state),
    minAge: num(searchParams.minAge),
    maxAge: num(searchParams.maxAge),
    lastDate: str(searchParams.lastDate) as JobFilters["lastDate"],
    page,
    pageSize: 9,
  };
}

function pageHref(searchParams: SP, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (!v) return;
    arr(v).forEach((val) => params.append(k, val));
  });
  params.set("page", String(page));
  return `/jobs?${params.toString()}`;
}

export default async function JobsPage({ searchParams }: { searchParams: SP }) {
  const filters = buildFilters(searchParams);
  const { results, total } = await queryJobs(filters);
  const pageSize = filters.pageSize || 9;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = filters.page || 1;

  const activeChips: { label: string; href: string }[] = [];
  if (filters.gender && filters.gender !== "all") activeChips.push({ label: `Gender: ${filters.gender}`, href: "gender" });
  filters.categories?.forEach((c) => activeChips.push({ label: c.toUpperCase(), href: `categories:${c}` }));
  filters.qualifications?.forEach((q) => activeChips.push({ label: q, href: `qualifications:${q}` }));

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          {filters.q ? `Search results for "${filters.q}"` : "Latest Jobs"}
        </h1>
        <p className="mt-1 text-sm text-ink-700/70">
          Showing jobs matching your eligibility — {total} vacanc{total === 1 ? "y" : "ies"} found.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar - sticky */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
            <FilterPanel searchParams={searchParams} id="desktop-filters" />
          </div>
        </aside>

        {/* Mobile filter drawer trigger */}
        <div className="lg:hidden flex items-center justify-between">
          <input type="checkbox" id="mobile-filter-toggle" className="peer hidden" />
          <label
            htmlFor="mobile-filter-toggle"
            className="flex-1 cursor-pointer rounded-lg border border-ink-900/15 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-800 shadow-card"
          >
            Filter Jobs
          </label>
          <div className="fixed inset-0 z-50 hidden peer-checked:block">
            <label htmlFor="mobile-filter-toggle" className="absolute inset-0 bg-ink-900/40" />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-bold text-ink-900">Filter Jobs</span>
                <label htmlFor="mobile-filter-toggle" className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/15">
                  ✕
                </label>
              </div>
              <FilterPanel searchParams={searchParams} id="mobile-filters" />
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeChips.map((c) => (
                <span key={c.label} className="chip chip-active py-1 px-2.5 text-xs">
                  {c.label}
                </span>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-ink-900/20 bg-white p-10 text-center">
              <p className="font-display text-lg font-semibold text-ink-900">No matching jobs found</p>
              <p className="mt-1 text-sm text-ink-700/70">
                Try widening your filters — for example, remove a category or qualification.
              </p>
              <Link href="/jobs" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <Link
                href={pageHref(searchParams, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  currentPage === 1 ? "pointer-events-none opacity-40 border-ink-900/10" : "border-ink-900/15 hover:bg-ink-900/5"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-ink-700">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={pageHref(searchParams, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  currentPage === totalPages ? "pointer-events-none opacity-40 border-ink-900/10" : "border-ink-900/15 hover:bg-ink-900/5"
                }`}
              >
                Load More
              </Link>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
