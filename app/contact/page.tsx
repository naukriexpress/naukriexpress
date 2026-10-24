import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the NaukriExpress team for job-listing corrections, recruitment information queries or advertisement requests. Include the relevant page and official source when reporting an issue.",
  alternates: {
    canonical: "https://www.naukriexpress.space/contact",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Contact Us | NaukriExpress",
    description: "Contact the NaukriExpress team for job-listing corrections, recruitment information queries or advertisement requests. Include the relevant page and official source when reporting an issue.",
    url: "https://www.naukriexpress.space/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | NaukriExpress",
    description: "Contact the NaukriExpress team for job-listing corrections, recruitment information queries or advertisement requests. Include the relevant page and official source when reporting an issue.",
  },
};

export default function ContactPage() {
  return (
    <main className="container-page contact-page-shell py-8 sm:py-10">
      <div className="mb-6">
        <span className="contact-kicker inline-flex rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-800">
          We’re here to help
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Contact Us
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700/70">
          Have a question, found an error in a job listing, or want to reach the
          NaukriExpress team? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <aside className="contact-info-card rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50/60 p-5 shadow-sm sm:p-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-sky-100 bg-white text-2xl shadow-sm" aria-hidden="true">
            ✉️
          </div>
          <h2 className="font-display text-lg font-extrabold text-slate-950">
            Get in touch
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            For a job-listing correction, please include the job page and official notification link.
          </p>

          <div className="mt-5 space-y-3">
            <div className="contact-info-tile rounded-xl border border-sky-100 bg-white/90 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-800">Email</p>
              <a href="mailto:naukriexpress.co.ai@gmail.com" className="mt-1 block break-words text-sm font-bold text-slate-950 underline decoration-sky-300 underline-offset-4">
                naukriexpress.co.ai@gmail.com
              </a>
            </div>
            <div className="contact-info-tile rounded-xl border border-violet-100 bg-white/90 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-800">Response Time</p>
              <p className="mt-1 text-sm font-bold text-slate-950">Within 2 business days</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Please do not include passwords or other sensitive personal information.
          </p>
        </aside>

        <form action="https://formspree.io/f/mzebzbyy" method="POST" className="contact-form-card space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900">Send a message</h2>
            <p className="mt-1 text-sm text-ink-700/70">We usually respond within two business days.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-900" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" autoComplete="name" required className="w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-3 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-sky-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-900" htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-3 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-sky-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-900" htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={5} required className="w-full resize-y rounded-xl border border-ink-900/15 bg-white px-3.5 py-3 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-sky-100" />
          </div>
          <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-brand-700 bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 sm:w-auto">
            Send Message →
          </button>
          <p className="text-xs leading-relaxed text-ink-700/60">
            Messages are submitted through our contact form service. Please include
            the official source when reporting a correction.
          </p>
        </form>
      </div>
    </main>
  );
}
