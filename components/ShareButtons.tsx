"use client";

import { useState } from "react";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable - fail silently, link is still visible to select manually.
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-leaf-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-leaf-600 transition-colors"
      >
        WhatsApp
      </a>
      <a
        href={tgHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
      >
        Telegram
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-3.5 py-2 text-sm font-semibold text-ink-800 hover:bg-ink-900/5 transition-colors"
      >
        {copied ? "Link copied!" : "Copy Link"}
      </button>
    </div>
  );
}
