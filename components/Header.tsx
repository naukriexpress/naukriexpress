import Link from "next/link";
import HeaderLiveStats from "./HeaderLiveStats";
import ThemeToggle from "./ThemeToggle";
import AnnouncementChatWidget from "./AnnouncementChatWidget";
import QuickNavigation from "./QuickNavigation";
import { NAUKRIEXPRESS_WORDMARK } from "./naukriexpressWordmark";
import styles from "./HeaderReference.module.css";

export default function Header() {
  return (
    <header className={`site-header-shell sticky top-0 z-40 border-b ${styles.referenceShell}`}>
      <div className="site-header-main-row container-page flex items-center justify-between gap-3">
        <div className="site-header-brand-stack">
          <Link href="/" className="site-header-brand flex min-w-0 shrink items-center">
            <img
              className="site-header-brand-image block h-auto object-contain"
              src={NAUKRIEXPRESS_WORDMARK}
              alt="Naukr!Express.space"
              width={1600}
              height={320}
              loading="eager"
              fetchPriority="high"
            />
          </Link>

          <div className="site-header-live-desktop">
            <HeaderLiveStats />
          </div>
        </div>

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
              <path d="m3 10 9-7 9 7" />
              <path d="M5 9.5V21h14V9.5M9 21v-7h6v7" />
            </svg>
            <span>Home</span>
          </Link>

          <AnnouncementChatWidget showLabel />
        </div>
      </div>

      <div className="site-header-live-mobile">
        <HeaderLiveStats />
      </div>

      <QuickNavigation />
    </header>
  );
}
