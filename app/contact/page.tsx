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
    <div className="container-page py-10 max-w-2xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Contact Us</h1>
      <p className="mt-2 text-sm text-ink-700/70">
        Have a question, found an error in a job listing, or want to reach the
        NaukriExpress team? Send us a message below.
      </p>

      <form action="https://formspree.io/f/mzebzbyy" method="POST" className="mt-8 space-y-4 rounded-xl2 border border-ink-900/10 bg-white p-6 sm:p-8">
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5" htmlFor="name">Full Name</label>
          <input id="name" name="name" type="text" required className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5" htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" required className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5" htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={5} required className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500" />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
          Send Message
        </button>
        <p className="text-xs text-ink-700/50">
          Messages are submitted through our contact form service. Please include
          the job page and official notification link when reporting a correction,
          and do not include passwords or sensitive personal information.
        </p>
      </form>

      <div className="mt-6 text-sm text-ink-700">
        <p><strong>Email:</strong> naukriexpress.co.ai@gmail.com</p>
        <p><strong>Response time:</strong> Within 2 business days</p>
      </div>
    </div>
  );
}
