import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { Category, Qualification } from "@/lib/types";
import { getDistinctStates } from "@/lib/db";

const CATEGORIES: Category[] = ["open", "obc", "sc", "st", "ews"];
const QUALIFICATIONS: Qualification[] = [
  "10th", "12th", "iti", "diploma", "graduate", "post_graduate", "engineering", "law", "medical", "any_graduate",
];

export default async function EligibilityFinder() {
  const states = await getDistinctStates();

  return (
    <section className="container-page -mt-10 sm:-mt-14 relative z-10">
      <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-8 shadow-cardHover">
        <div className="mb-5">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
            Find Jobs According to Your Eligibility
          </h2>
          <p className="mt-1 text-sm text-ink-700">
            Pick your gender, category, qualification and location — we'll show only the vacancies you qualify for.
          </p>
        </div>

        <form method="get" action="/jobs" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-ink-900 mb-2">Select Gender</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "both", label: "M & F" },
              ].map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input type="radio" name="gender" value={opt.value} defaultChecked={opt.value === "all"} className="peer hidden" />
                  <span className="chip chip-inactive peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white text-xs py-1.5 px-2.5">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-ink-900 mb-2">Select Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="checkbox" name="categories" value={c} className="peer hidden" />
                  <span className="chip chip-inactive peer-checked:border-leaf-600 peer-checked:bg-leaf-600 peer-checked:text-white text-xs py-1.5 px-2.5">
                    {CATEGORY_LABELS[c]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-ink-900 mb-2" htmlFor="eligibility-qualification">
              Select Qualification
            </label>
            <select
              id="eligibility-qualification"
              name="qualifications"
              multiple
              size={1}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm bg-white focus:border-brand-500 h-[42px]"
              onChange={undefined}
            >
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>{QUALIFICATION_LABELS[q]}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-ink-700/50">Ctrl/Cmd-click to select more than one</p>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-ink-900 mb-2" htmlFor="eligibility-state">
              Select Location
            </label>
            <select
              id="eligibility-state"
              name="state"
              defaultValue="all"
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm bg-white focus:border-brand-500"
            >
              <option value="all">All India</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors sm:w-auto"
            >
              Find My Eligible Jobs
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
