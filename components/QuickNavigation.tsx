"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName = "apprentice" | "education" | "results" | "answer" | "syllabus" | "scholarship" | "contact";

const ITEMS: Array<{ href: string; label: string; icon: IconName; tone: "sage" | "mist" | "sand" }> = [
  { href: "/apprentice", label: "Apprenticeship", icon: "apprentice", tone: "sage" },
  { href: "/education", label: "Education", icon: "education", tone: "mist" },
  { href: "/results", label: "Results", icon: "results", tone: "sage" },
  { href: "/answer-key", label: "Answer Key", icon: "answer", tone: "sand" },
  { href: "/syllabus", label: "Syllabus", icon: "syllabus", tone: "mist" },
  { href: "/scholarship", label: "Scholarship", icon: "scholarship", tone: "sand" },
  { href: "/contact", label: "Contact Us", icon: "contact", tone: "sage" },
];

function NavIcon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "site-quicknav-icon",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "apprentice":
      return <svg {...common}><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6" /></svg>;
    case "education":
      return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" /><path d="M4 6h13M8 9h7M8 13h7" /></svg>;
    case "results":
      return <svg {...common}><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 11v4m-4 5 4-2 4 2-1-5H9l-1 5Z" /></svg>;
    case "answer":
      return <svg {...common}><path d="M7 3h8l4 4v14H5V3h2Z" /><path d="M15 3v5h4M8 13h8M8 17h5" /><path d="m8 9 1.5 1.5L12 8" /></svg>;
    case "syllabus":
      return <svg {...common}><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23V5.5ZM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5A2.5 2.5 0 0 1 21 23V5.5Z" /></svg>;
    case "scholarship":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="m8.5 11-1.5 10 5-2 5 2-1.5-10" /><path d="m10 8 1.3 1.3L14 6.5" /></svg>;
    case "contact":
      return <svg {...common}><path d="M4 5h16v12H9l-5 4V5Z" /><path d="M8 9h8M8 13h5" /></svg>;
  }
}

export default function QuickNavigation() {
  const pathname = usePathname();

  return (
    <div className="site-quicknav-shell">
      <nav className="container-page site-quicknav" aria-label="Quick navigation">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              data-tone={item.tone}
              data-active={active ? "true" : "false"}
              className="site-quicknav-link"
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
