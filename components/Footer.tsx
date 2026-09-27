import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink-900 text-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-saffron-500 font-display text-sm font-bold text-white">
              NX
            </span>
            <span className="font-display text-lg font-bold">NaukriExpress</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            India's job update portal for the latest government and private
            vacancies, admit cards, results, answer keys and syllabus —
            filtered by your own eligibility.
          </p>
          <p className="mt-3 text-xs text-white/40">
            Founded by BGI Cybercafe
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white/50 mb-3">
            Explore
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/jobs" className="hover:text-white">Latest Jobs</Link></li>
            <li><Link href="/jobs?jobType=government" className="hover:text-white">Government Jobs</Link></li>
            <li><Link href="/jobs?state=Maharashtra" className="hover:text-white">Maharashtra Jobs</Link></li>
            <li><Link href="/apprenticeships" className="hover:text-white">Apprenticeships</Link></li>
            <li><Link href="/scholarships" className="hover:text-white">Scholarships</Link></li>
            <li><Link href="/admit-card" className="hover:text-white">Admit Card</Link></li>
            <li><Link href="/results" className="hover:text-white">Results</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white/50 mb-3">
            Resources
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/answer-key" className="hover:text-white">Answer Key</Link></li>
            <li><Link href="/syllabus" className="hover:text-white">Syllabus</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/admin/login" className="hover:text-white">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white/50 mb-3">
            Legal
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="container-page text-xs text-white/50">
          © {new Date().getFullYear()} NaukriExpress, a BGI Cybercafe initiative.
          All rights reserved. This is an independent job information portal
          and is not affiliated with any government body. Always verify
          details on the official website before applying.
        </p>
      </div>
    </footer>
  );
}
