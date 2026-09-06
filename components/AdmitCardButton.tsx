"use client";

import { useState, useEffect } from "react";
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

  // Browser mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Admit Cards load
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

  // Popup open hone par website scroll band
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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
      className="
        fixed
        inset-0
        z-[999999]
        bg-black/70
        flex
        items-center
        justify-center
        p-4
      "
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="
          bg-white
          w-full
          max-w-md
          rounded-2xl
          shadow-2xl
          flex
          flex-col
          overflow-hidden
        "
        style={{
          maxHeight: "80dvh",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              📄 Latest Admit Cards
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {links.length} Admit Card Updates
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-full
              bg-gray-100
              hover:bg-red-100
              text-gray-700
              hover:text-red-600
              font-bold
              text-lg
            "
          >
            ✕
          </button>
        </div>

        {/* Admit Card List */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-4
            space-y-3
          "
          style={{
            minHeight: 0,
          }}
        >
          {links.map((item) => (
            <a
              key={item.id}
              href={item.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                block
                w-full
                p-4
                bg-amber-50
                hover:bg-amber-100
                border
                border-amber-300
                rounded-xl
                text-gray-900
                font-semibold
                text-sm
                sm:text-base
                transition-all
              "
            >
              👉 {item.title}
            </a>
          ))}
        </div>

        {/* Bottom Close Button */}
        <div className="p-4 border-t bg-white shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="
              w-full
              bg-gray-100
              hover:bg-gray-200
              text-gray-900
              py-3
              rounded-xl
              font-bold
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Admit Card Floating Button */}
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

      {/* IMPORTANT: Modal directly BODY me render hoga */}
      {mounted &&
        isOpen &&
        createPortal(modal, document.body)}
    </>
  );
}