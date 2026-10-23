import { getPublicAdmitCardLinks } from "@/lib/public-content-cache";

type AdmitCardLink = {
  id: number;
  title: string;
  url: string;
};

export default async function InfoListingPage({
  title,
  description,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaLabel: string;
}) {
  let links: AdmitCardLink[] = [];

  try {
    links = await getPublicAdmitCardLinks();
  } catch (error) {
    console.error("Admit card listing load error:", error);
    return (
      <div className="container-page py-10">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-700/70">{description}</p>
        <p role="alert" className="mt-8 rounded-xl border border-ink-900/10 bg-white p-5 text-sm text-ink-700">
          Admit card links are temporarily unavailable. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">{description}</p>

      {links.length === 0 ? (
        <p className="mt-8 rounded-xl border border-ink-900/10 bg-white p-5 text-sm text-ink-700">
          Abhi koi Admit Card update publish nahi kiya gaya hai. Kripya baad mein check karein.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-ink-900/10 rounded-xl2 border border-ink-900/10 bg-white">
          {links.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-brand-50/50"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{item.title}</p>
                <p className="text-xs text-ink-700/60">Admit card / hall ticket link</p>
              </div>
              <span className="shrink-0 rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700">
                {ctaLabel}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
