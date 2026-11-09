import Link from "next/link";
import HeaderLiveStats from "./HeaderLiveStats";
import ThemeToggle from "./ThemeToggle";
import AnnouncementChatWidget from "./AnnouncementChatWidget";
import QuickNavigation from "./QuickNavigation";
import { NAUKRIEXPRESS_WORDMARK } from "./naukriexpressWordmark";

export default function Header() {
  return (
    <header className="site-header-shell sticky top-0 z-40 border-b">
      <div className="site-header-live-strip text-xs text-white sm:text-sm">
        <div className="container-page flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1.5">
          <span className="site-header-live-label inline-flex items-center gap-1 font-bold">
            <span className="site-header-live-dot h-1.5 w-1.5 animate-pulse rounded-full" aria-hidden="true" />
            LIVE
          </span>
          <HeaderLiveStats />
        </div>
      </div>

      <div className="site-header-main-row container-page flex items-center justify-between gap-3 py-3">
        <Link href="/" className="site-header-brand flex min-w-0 shrink items-center gap-0">
          <span className="site-header-brand-copy flex min-w-0 flex-col leading-tight">
            <span className="site-header-brand-titleline">
              <img
                className="site-header-brand-image"
                src={NAUKRIEXPRESS_WORDMARK}
                alt="Naukr!Express.space"
                width={600}
                height={101}
                loading="eager"
                fetchPriority="high"
              />
            </span>
          </span>
        </Link>

        <div className="site-header-actions flex shrink-0 items-center gap-2">
          <div className="site-header-theme-desktop hidden items-center gap-2 lg:flex">
            <ThemeToggle />
          </div>
          <div className="site-header-theme-mobile flex items-center gap-2 lg:hidden">
            <ThemeToggle />
          </div>
          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className="site-header-home-action inline-flex h-10 w-[116px] shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 10 9-7 9 7" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" />
            </svg>
            <span>Home</span>
          </Link>
          <AnnouncementChatWidget showLabel />
        </div>
      </div>

      <QuickNavigation />
    </header>
  );
}
