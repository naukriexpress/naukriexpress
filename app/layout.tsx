import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RunningTicker from "@/components/RunningTicker";
import SiteVisitTracker from "@/components/SiteVisitTracker";

const SITE_URL = "https://www.naukriexpress.space";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  icons: { icon: "/pwa-icon.svg", shortcut: "/pwa-icon.svg", apple: "/pwa-icon.svg" },
  other: {
    "google-adsense-account": "ca-pub-7337308462039392",
  },
  title: {
    default: "NaukriExpress - Latest Government Jobs, Private Jobs & Apprenticeship",
    template: "%s | NaukriExpress",
  },
  description:
    "NaukriExpress brings you the latest government jobs, private jobs, Maharashtra jobs, apprenticeship vacancies, admit cards, results, answer keys and syllabus. Find recruitment updates, eligibility details and application links.",
  keywords: [
    "job update",
    "government jobs",
    "private jobs",
    "maharashtra jobs",
    "sarkari naukri",
    "apprenticeship jobs",
    "apprentice recruitment",
    "ITI apprentice jobs",
    "admit card",
    "results",
    "answer key",
    "syllabus",
    "NaukriExpress",
  ],
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "NaukriExpress - Latest Government Jobs, Private Jobs & Apprenticeship",
    description:
      "Find government jobs, private jobs, apprenticeship vacancies, admit cards, results and recruitment updates across India.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NaukriExpress",
    description:
      "Latest government jobs, private jobs and apprenticeship vacancies across India.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0F3255",
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `try {
  var savedTheme = localStorage.getItem("naukriexpress-theme");
  var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var initialTheme = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : systemPrefersDark ? "dark" : "light";
  document.documentElement.dataset.theme = initialTheme;
} catch (_) {
  document.documentElement.dataset.theme =
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NaukriExpress",
    url: SITE_URL,
    description:
      "NaukriExpress provides government jobs, private jobs, apprenticeship vacancies and recruitment updates across India.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteVisitTracker />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7337308462039392"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema),
          }}
        />

        <RunningTicker />
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
