import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>Last updated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
        <p>
          This Privacy Policy explains how NaukriExpress ("we", "us")
          collects, uses and protects information when you use this website.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">Information We Collect</h2>
        <p>
          We may collect basic analytics data (pages visited, device type,
          approximate location) and any information you voluntarily submit
          through our contact form, such as your name and email address.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">How We Use Information</h2>
        <p>
          We use collected information to operate and improve the website,
          respond to enquiries, and understand which job categories are most
          useful to visitors.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">Third-Party Links</h2>
        <p>
          Job listings link out to official government and company websites
          for applications. We are not responsible for the privacy practices
          of those external sites.
        </p>
        <h2 className="font-display font-bold text-ink-900 mt-6">Contact</h2>
        <p>For privacy-related questions, reach us via the Contact Us page.</p>
      </div>
    </div>
  );
}
