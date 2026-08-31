import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">Terms &amp; Conditions</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>
          By accessing and using NaukriExpress, you agree to the following
          terms.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">Use of Content</h2>
        <p>
          Content on this website is provided for general informational
          purposes only and does not constitute official recruitment
          documentation. Always refer to the official notification for final
          eligibility, dates and instructions.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">No Guarantee of Outcome</h2>
        <p>
          We do not guarantee employment, interview calls, or any outcome
          related to jobs listed on this website.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          website after changes constitutes acceptance of the revised terms.
        </p>
      </div>
    </div>
  );
}
