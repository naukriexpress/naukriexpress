import { getPublicAdmitCardLinks } from "@/lib/public-content-cache";
import AdmitCardSearchList from "@/components/AdmitCardSearchList";

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

      <AdmitCardSearchList links={links} ctaLabel={ctaLabel} />
    </div>
  );
}
