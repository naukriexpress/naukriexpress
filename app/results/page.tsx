import type { Metadata } from "next";
import { getAllResults } from "@/lib/db";

// Always fetch fresh from the database — a result published from the Admin
// Panel must show up here immediately, on every device.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Results - Check Exam & Recruitment Results",
  description: "Check the latest results for government exams and recruitment drives across India.",
};

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ResultsPage() {
  const allResults = await getAllResults();
  const results = allResults.filter((r: any) => r.status === "published");

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Results</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">
        Check the latest results for recruitment exams and government job drives.
      </p>

      {results.length === 0 ? (
        <div className="mt-8 rounded-xl2 border border-ink-900/10 bg-white p-8 text-center text-sm text-ink-700/60">
          No results available right now. Please check back soon.
        </div>
      ) : (
        <div className="mt-8 divide-y divide-ink-900/10 rounded-xl2 border border-ink-900/10 bg-white">
          {results.map((r: any) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{r.title}</p>
                {r.shortDescription && (
                  <p className="mt-0.5 text-sm text-ink-700/70 line-clamp-2">{r.shortDescription}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-700/60">
                  {r.category && <span className="chip chip-inactive py-0.5 px-2 text-xs">{r.category}</span>}
                  {formatDate(r.resultDate) && <span>Result Date: {formatDate(r.resultDate)}</span>}
                </div>
              </div>
              <a
                href={r.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                View Result
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
