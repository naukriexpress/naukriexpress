import Link from "next/link";
import { queryJobs, getDistinctStates } from "@/lib/db";
import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { Category, Qualification } from "@/lib/types";
import JobCard from "@/components/JobCard";
import HeroSearch from "@/components/HeroSearch";
import EligibilityFinder from "@/components/EligibilityFinder";

export default async function HomePage() {
  const [{ results: latestJobs }, { results: featuredJobs }, states] = await Promise.all([
    queryJobs({ sort: "latest", jobType: ["government", "private", "contract", "apprenticeship", "internship"], pageSize: 6 }),
    queryJobs({ featuredOnly: true, jobType: ["government", "private", "contract", "apprenticeship", "internship"], pageSize: 4 }),
    getDistinctStates(),
  ]);
  const categories: Category[] = ["open", "obc", "sc", "st", "ews"];
  const qualifications: Qualification[] = ["10th", "12th", "iti", "diploma", "graduate", "engineering"];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-brand-800 to-brand-700 pb-14 pt-10 sm:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="container-page relative text-center">
          <span className="chip chip-inactive mx-auto mb-5 border-white/20 bg-white/10 text-white backdrop-blur">
            Updated daily • {latestJobs.length > 0 ? "New vacancies added regularly" : "Sample data"}
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
            Find the Right Job.<br className="hidden sm:block" /> Faster, and Filtered for You.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-100 sm:text-base">
            Government &amp; private job updates across India — filtered by
            gender, category, qualification and location so you only see
            jobs you're actually eligible for.
          </p>
          <div className="mt-6">
            <HeroSearch />
          </div>
        </div>
      </section>

      <EligibilityFinder />

      {/* Latest Jobs */}
      <section className="container-page mt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Latest Job Updates</h2>
            <p className="text-sm text-ink-700/70 mt-1">Freshly posted vacancies, updated every day.</p>
          </div>
          <Link href="/jobs" className="hidden sm:inline text-sm font-semibold text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <Link href="/jobs" className="mt-5 block text-center text-sm font-semibold text-brand-700 sm:hidden">
          View all jobs →
        </Link>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="container-page mt-16">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold text-ink-900">Featured Jobs</h2>
            <p className="text-sm text-ink-700/70 mt-1">High-vacancy and high-interest recruitments.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* State-wise Jobs */}
      <section className="container-page mt-16">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-5">Browse Jobs by State</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs" className="chip chip-inactive">All India</Link>
          {states.map((s) => (
            <Link key={s} href={`/jobs?state=${encodeURIComponent(s)}`} className="chip chip-inactive">
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* Qualification-wise */}
      <section className="container-page mt-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-5">Browse Jobs by Qualification</h2>
        <div className="flex flex-wrap gap-2">
          {qualifications.map((q) => (
            <Link key={q} href={`/jobs?qualifications=${q}`} className="chip chip-inactive">
              {QUALIFICATION_LABELS[q]}
            </Link>
          ))}
        </div>
      </section>

      {/* Category-wise */}
      <section className="container-page mt-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-5">Browse Jobs by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link key={c} href={`/jobs?categories=${c}`} className="chip chip-inactive">
              {CATEGORY_LABELS[c]}
            </Link>
          ))}
        </div>
      </section>

      {/* Gender-wise */}
      <section className="container-page mt-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-5">Browse Jobs by Gender Eligibility</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs?gender=male" className="chip chip-inactive">Male</Link>
          <Link href="/jobs?gender=female" className="chip chip-inactive">Female</Link>
          <Link href="/jobs?gender=both" className="chip chip-inactive">Male &amp; Female</Link>
        </div>
      </section>

      {/* Important Links */}
      <section className="container-page mt-16 mb-16">
        <div className="rounded-xl2 bg-brand-50 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Important Links</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Admit Card", href: "/admit-card" },
              { label: "Results", href: "/results" },
              { label: "Answer Key", href: "/answer-key" },
              { label: "Syllabus", href: "/syllabus" },
              { label: "Government Jobs", href: "/jobs?jobType=government" },
              { label: "Maharashtra Jobs", href: "/jobs?state=Maharashtra" },
              { label: "Apprenticeships", href: "/apprenticeships" },
              { label: "Scholarships", href: "/scholarships" },
              { label: "Jobs Closing Today", href: "/jobs?lastDate=today" },
              { label: "Contact Us", href: "/contact" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg bg-white px-3 py-3 text-center text-sm font-medium text-ink-800 shadow-card hover:shadow-cardHover transition-shadow"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
