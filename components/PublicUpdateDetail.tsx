import Link from "next/link";
import type { AdmitCardLink, SiteUpdateItem } from "@/lib/public-content-cache";

type RecordData =
  | { kind: "admit-card"; item: AdmitCardLink }
  | { kind: "site-update"; item: SiteUpdateItem };

const CATEGORY_LABELS: Record<string, string> = {
  results: "Results",
  "answer-key": "Answer Key",
  syllabus: "Syllabus",
  education: "Education",
  scholarship: "Scholarship",
};

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function dateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = String(value).slice(0, 10);
  const parsed = new Date(raw + "T00:00:00Z");
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string | null;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  if (!href) return null;
  const styles = variant === "primary"
    ? "border-[#356F66] bg-[#356F66] text-white hover:border-[#2F625B] hover:bg-[#2F625B]"
    : "border-[#D5D9DF] bg-white text-[#19334D] hover:bg-[#F7F9FA]";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${styles}`}
    >
      {children}
    </a>
  );
}

export default function PublicUpdateDetail({ record }: { record: RecordData }) {
  if (record.kind === "admit-card") {
    const url = safeExternalUrl(record.item.url);
    return (
      <main className="container-page py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-700/70">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/admit-card" className="hover:text-brand-700">Admit Card</Link>
        </nav>
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-700">Admit Card / Hall Ticket</p>
          <h1 className="font-display text-2xl font-black leading-tight text-ink-900 sm:text-3xl">{record.item.title}</h1>
          <p className="mt-4 text-sm leading-7 text-ink-700">
            Open the official admit card or hall ticket link using the button below. Check the official notice for login requirements, exam date and instructions.
          </p>
          <div className="mt-6">
            <ActionLink href={url}>Open Official Admit Card ↗</ActionLink>
          </div>
        </article>
      </main>
    );
  }

  const item = record.item;
  const category = item.category;
  const categoryLabel = CATEGORY_LABELS[category] || "Recruitment Update";
  const primaryUrl = safeExternalUrl(item.item_url);
  const applyUrl = safeExternalUrl(item.apply_url);
  const objectionUrl = safeExternalUrl(item.objection_url);
  const capUrl = safeExternalUrl(item.cap_url);
  const officialUrl = safeExternalUrl(item.official_website_url);
  const detailDates = [
    ["Published", dateLabel(item.publish_date)],
    ["Start Date", dateLabel(item.start_date)],
    ["Last Date", dateLabel(item.last_date)],
    ["Exam Date", dateLabel(item.exam_date)],
    ["Academic Year", item.academic_year],
  ].filter((entry) => Boolean(entry[1]));

  return (
    <main className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-700/70">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">›</span>
        <Link href={`/${category}`} className="hover:text-brand-700">{categoryLabel}</Link>
      </nav>
      <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card sm:p-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-700">{categoryLabel}</p>
        <h1 className="font-display text-2xl font-black leading-tight tracking-tight text-ink-900 sm:text-3xl">{item.title}</h1>
        {item.organization && <p className="mt-2 text-base font-semibold text-brand-700">{item.organization}</p>}
        {detailDates.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {detailDates.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-brand-100 bg-brand-50 p-3">
                <dt className="text-xs font-semibold text-brand-700">{label}</dt>
                <dd className="mt-1 break-words text-sm font-extrabold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {item.amount && (
          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase text-brand-700">Amount / Benefits</p>
            <p className="mt-1 font-bold text-ink-900">{item.amount}</p>
          </div>
        )}
        {item.eligibility && (
          <section className="mt-6">
            <h2 className="text-lg font-extrabold text-ink-900">Eligibility</h2>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink-800">{item.eligibility}</p>
          </section>
        )}
        {item.description && (
          <section className="mt-6">
            <h2 className="text-lg font-extrabold text-ink-900">Details</h2>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink-800">{item.description}</p>
          </section>
        )}
        <div className="mt-7 flex flex-wrap gap-2 border-t border-ink-900/10 pt-5">
          <ActionLink href={primaryUrl}>{category === "results" ? "Check Official Result ↗" : category === "answer-key" ? "Open Official Answer Key ↗" : category === "syllabus" ? "View Official Syllabus ↗" : category === "education" ? "Open Notification / PDF ↗" : "Open Official Notification ↗"}</ActionLink>
          <ActionLink href={applyUrl}>Apply Online ↗</ActionLink>
          <ActionLink href={objectionUrl} variant="secondary">Submit Objection ↗</ActionLink>
          <ActionLink href={capUrl} variant="secondary">CAP / Admission ↗</ActionLink>
          <ActionLink href={officialUrl} variant="secondary">Official Website ↗</ActionLink>
        </div>
      </article>
    </main>
  );
}
