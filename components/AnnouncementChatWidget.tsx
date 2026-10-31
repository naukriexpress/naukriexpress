"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Announcement = {
  id: string;
  title: string;
  message: string;
  status: "draft" | "published" | "scheduled";
  pinned: boolean;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Filter = "all" | "unread" | "pinned";
const READ_KEY = "naukriexpress-announcement-read-v1";

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function fullDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AnnouncementMark({ small = false }: { small?: boolean }) {
  return (
    <span className={"nx-updates-avatar " + (small ? "nx-updates-avatar--small" : "")} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={small ? 20 : 25} height={small ? 20 : 25} fill="none">
        <path d="M4 13.5v-3a1.5 1.5 0 0 1 1.5-1.5H8l9-4v14l-9-4H5.5A1.5 1.5 0 0 1 4 13.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="m8 15 1.5 4h3L11 16.3M20 9l1.5-1.5M20 15l1.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

export default function AnnouncementChatWidget({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadUpdates = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-updates", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Updates could not be loaded.");
      setItems(Array.isArray(data.items) ? data.items : []);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(READ_KEY) || "[]");
      if (Array.isArray(stored)) setReadIds(stored.filter((id): id is string => typeof id === "string"));
    } catch {
      setReadIds([]);
    }
    void loadUpdates();
    const handleFocus = () => void loadUpdates();
    const refreshInterval = window.setInterval(() => void loadUpdates(), 30_000);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadUpdates, pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); setSelectedId(null); }
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selected = items.find((item) => item.id === selectedId) || null;
  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;

  const visibleItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return items.filter((item) => {
      if (filter === "unread" && readIds.includes(item.id)) return false;
      if (filter === "pinned" && !item.pinned) return false;
      if (term && !(item.title + " " + item.message).toLocaleLowerCase().includes(term)) return false;
      return true;
    });
  }, [items, filter, readIds, search]);

  function markRead(id: string) {
    setReadIds((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      try {
        window.localStorage.setItem(READ_KEY, JSON.stringify(next));
      } catch {
        // Reading updates remains available when browser storage is disabled.
      }
      return next;
    });
  }

  function openAnnouncement(item: Announcement) {
    setSelectedId(item.id);
    markRead(item.id);
  }

  function closePanel() {
    setOpen(false);
    setSelectedId(null);
  }

  return (
    <>
      {open && (
        <div className="nx-updates-layer" onClick={closePanel}>
          <section
            className="nx-updates-panel"
            role="dialog"
            aria-modal="true"
            aria-label="NaukriExpress Admin Updates"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="nx-updates-header">
              <div className="flex min-w-0 items-center gap-3">
                {selected ? (
                  <button
                    type="button"
                    className="nx-updates-icon-button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back to all updates"
                  >
                    <svg viewBox="0 0 24 24" width="23" height="23" fill="none" aria-hidden="true">
                      <path d="m15 18-6-6 6-6M9 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : (
                  <AnnouncementMark />
                )}
                <div className="min-w-0">
                  <h2 className="nx-updates-brand-title">{selected ? "Announcement" : "NaukriExpress"}</h2>
                  <p className="nx-updates-subtitle">{selected ? "Official admin message" : "Official Admin Updates"}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="nx-updates-icon-button" onClick={() => { void loadUpdates(); }} aria-label="Refresh updates" title="Refresh">
                  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
                    <path d="M20 7v5h-5M4.7 9A7.5 7.5 0 0 1 18 6l2 6M4 17v-5h5m10.3 3A7.5 7.5 0 0 1 6 18l-2-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button type="button" className="nx-updates-icon-button" onClick={closePanel} aria-label="Close updates">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </header>

            {!selected ? (
              <>
                <div className="nx-updates-search-wrap">
                  <label className="nx-updates-search">
                    <svg viewBox="0 0 24 24" width="23" height="23" fill="none" aria-hidden="true">
                      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2"/>
                      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search admin updates"
                      aria-label="Search admin updates"
                    />
                    {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
                  </label>
                </div>

                <nav className="nx-updates-filters" aria-label="Filter announcements">
                  <button type="button" onClick={() => setFilter("all")} className={filter === "all" ? "is-active" : ""}>All</button>
                  <button type="button" onClick={() => setFilter("unread")} className={filter === "unread" ? "is-active" : ""}>
                    Unread {unreadCount > 0 && <span>{unreadCount}</span>}
                  </button>
                  <button type="button" onClick={() => setFilter("pinned")} className={filter === "pinned" ? "is-active" : ""}>Pinned</button>
                </nav>

                <div className="nx-updates-list" aria-live="polite">
                  <div className="nx-updates-list-heading">
                    <span>ADMIN ANNOUNCEMENTS</span>
                    <span>{items.length} {items.length === 1 ? "message" : "messages"}</span>
                  </div>
                  {loading ? (
                    <div className="nx-updates-empty">Loading announcements…</div>
                  ) : failed ? (
                    <div className="nx-updates-empty">
                      <strong>Updates are temporarily unavailable.</strong>
                      <button type="button" onClick={() => { setLoading(true); void loadUpdates(); }}>Try again</button>
                    </div>
                  ) : visibleItems.length === 0 ? (
                    <div className="nx-updates-empty">
                      <strong>{items.length === 0 ? "No announcements yet" : "No matching announcements"}</strong>
                      <span>{items.length === 0 ? "New admin messages will appear here." : "Try another search or filter."}</span>
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      const unread = !readIds.includes(item.id);
                      return (
                        <button type="button" key={item.id} className={"nx-updates-row " + (unread ? "is-unread" : "")} onClick={() => openAnnouncement(item)}>
                          <AnnouncementMark small />
                          <span className="nx-updates-row-copy">
                            <span className="nx-updates-row-top">
                              <strong>{item.title}</strong>
                              <time dateTime={item.publishAt || item.createdAt}>{shortDate(item.publishAt || item.createdAt)}</time>
                            </span>
                            <span className="nx-updates-row-preview">{item.message.split(/\s+/).join(" ")}</span>
                            <span className="nx-updates-row-meta">
                              {item.pinned && <span className="nx-updates-pin">⌖ Pinned</span>}
                              <span>{unread ? "New update" : "Admin message"}</span>
                            </span>
                          </span>
                          {unread && <span className="nx-updates-unread-dot" aria-label="Unread" />}
                        </button>
                      );
                    })
                  )}
                </div>

                <footer className="nx-updates-bottom-nav">
                  <button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M4 5.5h16v13H4zM7 9h10M7 12.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Updates</span>
                  </button>
                  <button type="button" className={filter === "unread" ? "is-active" : ""} onClick={() => setFilter("unread")}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9M12 7v5l3 2M17 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Unread</span>
                  </button>
                  <button type="button" className={filter === "pinned" ? "is-active" : ""} onClick={() => setFilter("pinned")}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="m8 4 8 0 1 5 3 3v2H4v-2l3-3 1-5ZM12 14v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Pinned</span>
                  </button>
                  <button type="button" onClick={closePanel}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M6 6h12v12H6zM9 9l6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Close</span>
                  </button>
                </footer>
              </>
            ) : (
              <article className="nx-updates-detail">
                <div className="nx-updates-detail-author">
                  <AnnouncementMark small />
                  <div>
                    <strong>NaukriExpress Admin</strong>
                    <time dateTime={selected.publishAt || selected.createdAt}>{fullDate(selected.publishAt || selected.createdAt)}</time>
                  </div>
                  {selected.pinned && <span className="nx-updates-pin">Pinned</span>}
                </div>
                <h3>{selected.title}</h3>
                <div className="nx-updates-detail-message">{selected.message}</div>
                <div className="nx-updates-readonly-note">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                  This is an official one-way announcement. Replies are disabled.
                </div>
              </article>
            )}
          </section>
        </div>
      )}

      <button
        type="button"
        className={"nx-updates-header-trigger " + (open ? "is-open" : "") + (unreadCount > 0 ? " has-unread" : "") + (compact ? " is-compact" : "")}
        onClick={() => {
          if (open) closePanel();
          else {
            setOpen(true);
            void loadUpdates();
          }
        }}
        aria-label={open ? "Close NaukriExpress updates" : `Open NaukriExpress updates, ${unreadCount} unread messages`}
        title={unreadCount > 0 ? `${unreadCount} unread NaukriExpress updates` : "NaukriExpress Updates"}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path d="M4 13.5v-3a1.5 1.5 0 0 1 1.5-1.5H8l9-4v14l-9-4H5.5A1.5 1.5 0 0 1 4 13.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="m8 15 1.5 4h3L11 16.3M20 9l1.5-1.5M20 15l1.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!open && unreadCount > 0 && <span className="nx-updates-header-count" aria-live="polite">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
    </>
  );
}
