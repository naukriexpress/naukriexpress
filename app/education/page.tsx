import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Education Entrance Exams & Admission Updates",
  description:
    "Explore Maharashtra and All India entrance exams, admission schedules, official notifications and application links on NaukriExpress.",
};

const categories = [
  "UG Entrance Exams",
  "PG Entrance Exams",
  "MBA / Management",
  "PhD / Research",
  "Medical / Health",
  "Engineering / Architecture",
  "Law Entrance Exams",
  "Teaching / Education",
  "Design & Arts",
  "Agriculture",
];

export default function EducationPage() {
  return (
    <section className="container-page py-8 sm:py-12">
      <div className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 shadow-card">
        <div className="px-5 py-9 text-center sm:px-10 sm:py-14">
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-saffron-100 text-brand-700 shadow-sm">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M6 11v5.2c3.2 2.6 8.8 2.6 12 0V11M21.5 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            NaukriExpress Education
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Education Entrance Directory
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink-700 sm:text-base">
            Maharashtra and All India entrance exams, admission schedules,
            official notifications and application links — all in one place.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-white/90 px-4 py-2 text-sm font-semibold text-saffron-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500" aria-hidden="true" />
            Directory updates are being prepared
          </div>
        </div>
        <div className="border-t border-brand-100 bg-white/75 px-5 py-6 sm:px-10 sm:py-8">
          <h2 className="text-center text-lg font-bold text-ink-900">
            Explore by Category
          </h2>
          <div className="mx-auto mt-4 grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category}
                className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-3 py-3 text-sm font-semibold text-ink-800 shadow-sm"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    <path d="M4 6v14.5A2.5 2.5 0 0 1 6.5 18H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                {category}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-ink-700/70">
            Exam-wise application dates, upcoming status, notification PDFs and
            Apply Online links will appear here as the directory is completed.
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
