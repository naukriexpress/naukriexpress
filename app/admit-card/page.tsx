import type { Metadata } from "next";
import { getAllAdmitCards } from "@/lib/db";

// Always fetch fresh from the database — an admit card published from the
// Admin Panel must show up here immediately, on every device.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admit Card - Download Exam Admit Cards",
  description: "Download the latest admit cards for government exams and recruitment drives across India.",
};

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdmitCardPage() {
  const allCards = await getAllAdmitCards();
  const cards = allCards.filter((c: any) => c.status === "published");

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Admit Card</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">
        Download the latest exam admit cards / hall tickets for government recruitment drives.
      </p>

      {cards.length === 0 ? (
        <div className="mt-8 rounded-xl2 border border-ink-900/10 bg-white p-8 text-center text-sm text-ink-700/60">
          No admit cards available right now. Please check back soon.
        </div>
      ) : (
        <div className="mt-8 divide-y divide-ink-900/10 rounded-xl2 border border-ink-900/10 bg-white">
          {cards.map((card: any) => (
            <div
              key={card.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{card.title}</p>
                <p className="text-xs text-ink-700/60">{card.organization}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-700/60">
                  {formatDate(card.admitCardDate) && (
                    <span>Admit Card: {formatDate(card.admitCardDate)}</span>
                  )}
                  {formatDate(card.examDate) && <span>Exam Date: {formatDate(card.examDate)}</span>}
                </div>
              </div>
              <a
                href={card.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Download Admit Card
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
