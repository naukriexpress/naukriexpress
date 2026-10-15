"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { Category, Qualification } from "@/lib/types";
import HeroSearch from "./HeroSearch";

const CATEGORIES: Category[] = ["open", "obc", "sc", "st", "ews"];
const QUALIFICATIONS: Qualification[] = [
  "10th", "12th", "iti", "diploma", "graduate", "post_graduate", "engineering", "law", "medical", "any_graduate",
];

export default function EligibilityFinder({
  states,
  variant = "home",
}: {
  states: string[];
  variant?: "home" | "menu";
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
{variant === "menu" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="block w-full rounded-xl bg-saffron-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-saffron-600"
        >
          Find Jobs According to Your Eligibility
        </button>
      ) : (
        <section className="container-page pt-6 sm:pt-8">
          <h1 className="sr-only">Find Jobs According to Your Eligibility</h1>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between gap-4 rounded-xl2 border border-ink-900/10 bg-white p-5 text-left shadow-card transition-shadow hover:shadow-cardHover sm:p-6"
          >
            <span>
              <span className="block font-display text-lg font-bold text-ink-900 sm:text-xl">
                Find Jobs According to Your Eligibility
              </span>
              <span className="mt-1 block text-sm text-ink-700">
                Choose your details to see matching vacancies.
              </span>
            </span>
            <span className="shrink-0 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white">
              Open
            </span>
          </button>
        </section>
      )}

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="eligibility-title"
              className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="eligibility-title" className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
                    Find Jobs According to Your Eligibility
                  </h2>
                  <p className="mt-1 text-sm text-ink-700">
                    Pick your gender, category, qualification and location — we'll show only the vacancies you qualify for.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close eligibility filters"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-900/15 text-xl font-bold text-ink-800 hover:bg-brand-50"
                >
                  ×
                </button>
              </div>

              <div className="mb-5">
                <HeroSearch />
              </div>

              <form method="get" action="/jobs" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-900">Select Gender</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "both", label: "M & F" },
                    ].map((opt) => (
                      <label key={opt.value} className="cursor-pointer">
                        <input type="radio" name="gender" value={opt.value} defaultChecked={opt.value === "all"} className="peer hidden" />
                        <span className="chip chip-inactive peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white px-2.5 py-1.5 text-xs">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-900">Select Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <label key={category} className="cursor-pointer">
                        <input type="checkbox" name="categories" value={category} className="peer hidden" />
                        <span className="chip chip-inactive peer-checked:border-leaf-600 peer-checked:bg-leaf-600 peer-checked:text-white px-2.5 py-1.5 text-xs">
                          {CATEGORY_LABELS[category]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-900" htmlFor="eligibility-qualification">
                    Select Qualification
                  </label>
                  <select
                    id="eligibility-qualification"
                    name="qualifications"
                    multiple
                    size={1}
                    className="h-[42px] w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm focus:border-brand-500"
                  >
                    {QUALIFICATIONS.map((qualification) => (
                      <option key={qualification} value={qualification}>{QUALIFICATION_LABELS[qualification]}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-ink-700/50">Ctrl/Cmd-click to select more than one</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink-900" htmlFor="eligibility-state">
                    Select Location
                  </label>
                  <select
                    id="eligibility-state"
                    name="state"
                    defaultValue="all"
                    className="w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm focus:border-brand-500"
                  >
                    <option value="all">All India</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 sm:w-auto"
                  >
                    Find My Eligible Jobs
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
