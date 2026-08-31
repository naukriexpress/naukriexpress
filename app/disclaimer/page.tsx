import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">Disclaimer</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>
          NaukriExpress is an independent, privately-run job information
          website. We are <strong>not affiliated with, endorsed by, or
          representing</strong> any government department, ministry, public
          sector undertaking, or private company mentioned on this site.
        </p>
        <p>
          Job vacancy details, eligibility criteria, dates and fees are
          compiled from publicly available notifications for informational
          convenience. While we try to keep listings accurate and up to
          date, errors or delays may occur.
        </p>
        <p>
          Candidates are strongly advised to verify every detail — including
          eligibility, dates, and fees — from the official notification PDF
          and the official website linked on each job page before applying
          or making any payment.
        </p>
        <p>
          NaukriExpress is not responsible for any loss or inconvenience
          arising from reliance on information published on this website.
        </p>
      </div>
    </div>
  );
}
