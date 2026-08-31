"use client";

import { useState, useEffect } from "react";

export default function AdmitCardButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("adminAdmitCards") || "[]");
    setLinks(saved);
  }, [isOpen]);

  if (links.length === 0) return null;

  return (
    <>
      {/* Floating Button jo mobile aur desktop dono par dikhega */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 text-sm sm:text-base cursor-pointer transition-transform active:scale-95"
      >
        <span>📄 Admit Card Updates</span>
        <span className="bg-white text-brand-700 rounded-full px-2 py-0.5 text-xs font-extrabold">
          {links.length}
        </span>
      </button>

      {/* Mobile Friendly Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col border border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Latest Admit Cards</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-red-600 font-bold text-xl px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable list taaki mobile par lambi list bhi aasani se dikhe */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {links.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all text-gray-900 font-semibold text-sm sm:text-base shadow-xs"
                >
                  👉 {item.title}
                </a>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}