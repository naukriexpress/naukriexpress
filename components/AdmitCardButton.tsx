"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface AdmitCardItem {
  id: string;
  title: string;
  downloadUrl: string;
  status: string;
}

export default function AdmitCardButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<AdmitCardItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  // Browser mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Admit Cards
  useEffect(() => {
    let cancelled = false;

    async function loadAdmitCards() {
      try {
        const res = await fetch("/api/admit-cards", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();
        const list: AdmitCardItem[] = json.data || [];

        if (!cancelled) {
          setLinks(
            list.filter((item) => item.status === "published")
          );
        }
      } catch (err) {
        console.error("Failed to load admit cards", err);
      }
    }

    loadAdmitCards();

    return () => {
      cancelled = true;
    };
  }, []);

  // Popup open hone par page scrolling band
  // aur Admit Card list ko top par reset karo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = 0;
        }
      }, 0);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (links.length === 0) return null;

  const modal = (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        width: "100%",
        height: "100dvh",
        background: "rgba(0,0,0,0.70)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",

          // IMPORTANT
          height: "auto",
          maxHeight: "75dvh",

          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",

          position: "relative",
          margin: "auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            flexShrink: 0,
            padding: "16px 18px",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              📄 Latest Admit Cards
            </h3>

            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              {links.length} Admit Card Updates
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              background: "#f3f4f6",
              color: "#374151",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* ADMIT CARD LIST */}
        <div
          ref={listRef}
          style={{
            flex: "1 1 auto",

            // VERY IMPORTANT
            minHeight: 0,

            overflowY: "auto",
            overflowX: "hidden",

            padding: "16px",

            display: "flex",
            flexDirection: "column",
            gap: "12px",

            scrollBehavior: "auto",
          }}
        >
          {links.map((item) => (
            <a
              key={item.id}
              href={item.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                flexShrink: 0,
                width: "100%",
                boxSizing: "border-box",

                padding: "15px",

                background: "#fffbeb",
                border: "1px solid #fbbf24",
                borderRadius: "12px",

                color: "#111827",
                textDecoration: "none",

                fontSize: "15px",
                fontWeight: 600,

                lineHeight: "1.4",
              }}
            >
              👉 {item.title}
            </a>
          ))}
        </div>

        {/* BOTTOM CLOSE BUTTON */}
        <div
          style={{
            flexShrink: 0,
            padding: "14px 16px",
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "100%",
              border: "none",
              background: "#f3f4f6",
              color: "#111827",
              padding: "13px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* FLOATING ADMIT CARD BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed
          bottom-6
          right-4
          sm:right-6
          z-[9998]
          bg-brand-600
          hover:bg-brand-700
          text-white
          px-4
          py-3
          rounded-full
          shadow-xl
          font-bold
          flex
          items-center
          gap-2
          text-sm
          sm:text-base
          cursor-pointer
          active:scale-95
        "
      >
        <span>📄 Admit Card Updates</span>

        <span className="bg-white text-brand-700 rounded-full px-2 py-0.5 text-xs font-extrabold">
          {links.length}
        </span>
      </button>

      {/* MODAL DIRECTLY DOCUMENT BODY ME */}
      {mounted &&
        isOpen &&
        createPortal(modal, document.body)}
    </>
  );
}