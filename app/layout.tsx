import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RunningTicker from "@/components/RunningTicker";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naukriexpress.space";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NaukriExpress - Latest Government & Private Job Vacancies in India",
    template: "%s | NaukriExpress",
  },
  description:
    "NaukriExpress brings you the latest government jobs, Maharashtra jobs, admit cards, results, answer keys and syllabus. Filter jobs by gender, category, qualification and location to find vacancies you're eligible for.",
  keywords: [
    "job update",
    "government jobs",
    "maharashtra jobs",
    "sarkari naukri",
    "admit card",
    "results",
    "answer key",
    "syllabus",
    "NaukriExpress",
  ],
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "NaukriExpress - Latest Government & Private Job Vacancies in India",
    description:
      "Find government and private job vacancies in India filtered by your gender, category, qualification and location.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NaukriExpress",
    description: "Latest government & private job vacancies across India.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0F3255",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NaukriExpress",
    url: SITE_URL,
    description:
      "NaukriExpress - Latest government and private job vacancies across India, filterable by eligibility.",
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <RunningTicker />
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}