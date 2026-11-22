import Link from "next/link";
import {
  getPublicSiteUpdates,
  type SiteUpdateCategory,
  type SiteUpdateItem,
} from "@/lib/public-content-cache";

type Props = { category: SiteUpdateCategory };

const CATEGORY_PRESENTATION: Record<
  SiteUpdateCategory,
  { icon: string; label: string; primaryAction: string }
> = {
  results: { icon: "🏆", label: "RESULT", primaryAction: "Check Official Result" },
  "answer-key": { icon: "📝", label: "ANSWER KEY", primaryAction: "Open Official Answer Key" },
  syllabus: { icon: "📚", label: "SYLLABUS", primaryAction: "View Official Syllabus" },
  scholarship: { icon: "🎓", label: "SCHOLARSHIP", primaryAction: "Official Scheme Details" },
  education: { icon: "🎓", label: "EDUCATION", primaryAction: "View Entrance Exam" },
};

const CATEGORY_LABELS: Record<SiteUpdateCategory, string> = {
  results: "Results",
  "answer-key": "Answer Keys",
  syllabus: "Syllabus",
  scholarship: "Scholarships",
  education: "Education",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function UpdateCard({ item }: { item: SiteUpdateItem }) {
  const presentation = CATEGORY_PRESENTATION[item.category] || CATEGORY_PRESENTATION.results;
  const initials = (item.organization || item.title)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();

  const rawActions = [
    {
      href: item.item_url,
      label: presentation.primaryAction,
      style: "border-blue-600 bg-white text-blue-700 hover:bg-blue-50",
    },
    {
      href: item.objection_url,
      label: "Submit Objection",
      style: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    },
    {
      href: item.apply_url,
      label: "Apply Online",
      style: "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800",
    },
    {
      href: item.cap_url,
      label: "CAP / Admission",
      style: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    },
    {
      href: item.official_website_url,
      label: "Official Website",
      style: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    },
  ];

  const seenUrls = new Set<string>();
  const actions = rawActions.flatMap((action) => {
    const href = safeExternalUrl(action.href);
    if (!href || seenUrls.has(href)) return [];
    seenUrls.add(href);
    return [{ ...action, href }];
  });

  const deadlineLabel =
    item.category === "answer-key" ? "Objection deadline" : "Last date";

  return (
    <article className="update-listing-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="update-card-icon grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-sky-100 bg-sky-50 font-display text-sm font-extrabold text-sky-800"
            aria-hidden="true"
          >
            {initials || presentation.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="update-card-kicker mb-1 inline-flex rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-sky-800">
              {presentation.icon} {presentation.label}
            </span>
            <h2 className="update-card-title break-words text-base font-extrabold leading-snug tracking-tight text-slate-950 sm:text-[17px]">
              <Link
                href={`/updates/${item.category}/${item.id}`}
                className="rounded-sm transition-colors hover:text-brand-700 focus-visible:outline-offset-4"
              >
                {item.title}
              </Link>
            </h2>
            {item.organization && (
              <p className="update-card-organization mt-1 break-words text-sm font-semibold text-sky-800">
                {item.organization}
              </p>
            )}
          </div>
        </div>

        {item.description && (
          <p className="update-card-description mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
            {item.description}
          </p>
        )}

        <dl className="mt-4 grid flex-1 grid-cols-1 gap-2.5">
          {item.amount && (
            <div className="update-detail update-detail--emerald rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
              <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                Scholarship Amount / Benefits
              </dt>
              <dd className="update-detail-value mt-1 break-words text-sm font-bold text-slate-950">
                {item.amount}
              </dd>
            </div>
          )}
          {item.eligibility && (
            <div className="update-detail update-detail--violet rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-3">
              <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-violet-800">
                Eligibility
              </dt>
              <dd className="update-detail-value mt-1 whitespace-pre-line break-words text-sm font-semibold text-slate-950">
                {item.eligibility}
              </dd>
            </div>
          )}
          {(item.publish_date || item.last_date) && (
            <div className="grid grid-cols-2 gap-2">
              {item.publish_date && (
                <div className="update-detail update-detail--sky min-w-0 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3">
                  <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-sky-800">
                    Published
                  </dt>
                  <dd className="update-detail-value mt-1 break-words text-xs font-bold text-slate-950">
                    {formatDate(item.publish_date)}
                  </dd>
                </div>
              )}
              {item.last_date && (
                <div className="update-detail update-detail--rose min-w-0 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-3">
                  <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-rose-800">
                    {deadlineLabel}
                  </dt>
                  <dd className="update-detail-value mt-1 break-words text-xs font-bold text-rose-700">
                    {formatDate(item.last_date)}
                  </dd>
                </div>
              )}
            </div>
          )}
        </dl>

        {actions.length > 0 && (
          <div className="update-card-actions mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`update-action inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-extrabold transition-colors sm:text-sm ${action.style}`}
              >
                {action.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * This is deliberately a Server Component. The first HTML response includes
 * the complete notices and summaries, so visitors and search crawlers do not
 * have to wait for a browser-only API request to discover the page content.
 */
export default async function PublicUpdatesList({ category }: Props) {
  let items: SiteUpdateItem[] = [];
  let unavailable = false;

  try {
    items = await getPublicSiteUpdates(category);
  } catch (error) {
    console.error(`Public ${category} listing load error:`, error);
    unavailable = true;
  }

  if (unavailable) {
    return (
      <div
        role="status"
        className="mt-8 rounded-2xl border border-ink-900/10 bg-white p-6 text-center shadow-card"
      >
        <p className="font-semibold text-ink-900">
          {CATEGORY_LABELS[category]} are temporarily unavailable.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-700/70">
          Please revisit this page later or use the official organisation
          website for time-sensitive information.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card">
        <p className="font-semibold text-ink-900">
          No {CATEGORY_LABELS[category].toLowerCase()} have been published here yet.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-700/70">
          This section will display a notice after the relevant authority
          releases one. Check the official organisation website for the latest
          announcement in the meantime.
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-flex text-sm font-bold text-brand-700 underline underline-offset-4"
        >
          Report a missing or incorrect update
        </Link>
      </div>
    );
  }

  return (
    <section
      className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label={`Published ${CATEGORY_LABELS[category]}`}
    >
      {items.map((item) => (
        <UpdateCard key={`${item.category}-${item.id}`} item={item} />
      ))}
    </section>
  );
}
