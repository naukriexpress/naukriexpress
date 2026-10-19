import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NaukriExpress | Recruitment Information Portal",
  description:
    "Learn about NaukriExpress, an independent recruitment information portal operated by BGI Cybercafe, and how we compile job notifications, eligibility details and official links.",
};

export default function AboutPage() {
  return (
    <div className="container-page py-10 max-w-3xl prose-sm">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">About NaukriExpress</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>
          NaukriExpress is an independent job information portal that helps
          candidates across India discover government and private job
          vacancies they are actually eligible for — filtered by gender,
          category, qualification, location and more.
        </p>
        <p>
          We aggregate publicly available recruitment notifications and
          present them in a clean, mobile-friendly format so job seekers
          spend less time searching and more time preparing.
        </p>
        <p>
          NaukriExpress is not affiliated with any government department,
          recruitment board, or private employer. Always verify details on
          the official notification before applying or making any payment.
        </p>
        <p>
          NaukriExpress is founded and operated by <strong>BGI Cybercafe</strong>.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">
          How We Prepare Recruitment Updates
        </h2>
        <p>
          Each listing is intended to help readers find the important details in
          one place: the recruiting organisation, posts or vacancy count when
          available, eligibility, key dates, and links to the official notice or
          application portal. Details vary by recruitment, so not every field
          will be available for every notice.
        </p>
        <p>
          Official notifications and recruiting-board websites are the final
          authority. When a date, vacancy count or application link has not been
          confirmed in our listing, readers should treat it as pending and check
          the recruiting organisation's notice before acting. We do not represent
          an estimate or previous recruitment cycle as a confirmed current rule.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">
          Corrections and Updates
        </h2>
        <p>
          Recruitment information can change after publication. If you spot a
          missing detail, an expired link or a possible error, please contact us
          through the Contact Us page and include the relevant NaukriExpress page
          and, where possible, the official notification or source. This helps us
          identify the exact detail that needs review.
        </p>
        <p>
          NaukriExpress provides summaries for convenience, not an official
          recruitment decision. Candidates should independently confirm their
          eligibility, dates, fees, document requirements and application status
          with the relevant authority.
        </p>
      </div>
    </div>
  );
}
