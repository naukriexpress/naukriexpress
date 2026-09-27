import { CATEGORY_LABELS, JOB_TYPE_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { Category, JobType, Qualification } from "@/lib/types";
import { getDistinctStates } from "@/lib/db";

type SP = Record<string, string | string[] | undefined>;

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function str(v: string | string[] | undefined): string {
  if (!v) return "";
  return Array.isArray(v) ? v[0] : v;
}

const CATEGORIES: Category[] = ["open", "obc", "sc", "st", "ews"];
const QUALIFICATIONS: Qualification[] = [
  "10th", "12th", "iti", "diploma", "graduate", "post_graduate", "engineering", "law", "medical", "any_graduate",
];
const JOB_TYPES: JobType[] = ["government", "private", "contract", "apprenticeship", "scholarship", "internship"];

export default async function FilterPanel({ searchParams, id = "filters" }: { searchParams: SP; id?: string }) {
  const gender = str(searchParams.gender) || "all";
  const selectedCategories = arr(searchParams.categories);
  const selectedQualifications = arr(searchParams.qualifications);
  const selectedJobTypes = arr(searchParams.jobType);
  const state = str(searchParams.state) || "all";
  const lastDate = str(searchParams.lastDate);
  const minAge = str(searchParams.minAge);
  const maxAge = str(searchParams.maxAge);
  const q = str(searchParams.q);
  const states = await getDistinctStates();

  return (
    <form id={id} method="get" action="/jobs" className="space-y-6">
      <input type="hidden" name="page" value="1" />

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Search</label>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Job title, department, qualification..."
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900 mb-2">Select Gender</legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "both", label: "Male & Female" },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={opt.value}
                defaultChecked={gender === opt.value}
                className="peer hidden"
              />
              <span className="chip chip-inactive peer-checked:chip-active peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900 mb-2">Select Category</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value={c}
                defaultChecked={selectedCategories.includes(c)}
                className="peer hidden"
              />
              <span className="chip chip-inactive peer-checked:border-leaf-600 peer-checked:bg-leaf-600 peer-checked:text-white">
                {CATEGORY_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-ink-700/60">Select multiple — jobs must match every category chosen.</p>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900 mb-2">Qualification</legend>
        <div className="flex flex-wrap gap-2">
          {QUALIFICATIONS.map((qk) => (
            <label key={qk} className="cursor-pointer">
              <input
                type="checkbox"
                name="qualifications"
                value={qk}
                defaultChecked={selectedQualifications.includes(qk)}
                className="peer hidden"
              />
              <span className="chip chip-inactive peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white text-xs py-1 px-2.5">
                {QUALIFICATION_LABELS[qk]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900 mb-2">Job Type</legend>
        <div className="flex flex-col gap-1.5">
          {JOB_TYPES.map((jt) => (
            <label key={jt} className="flex items-center gap-2 text-sm text-ink-800 cursor-pointer">
              <input
                type="checkbox"
                name="jobType"
                value={jt}
                defaultChecked={selectedJobTypes.includes(jt)}
                className="h-4 w-4 rounded border-ink-900/30 text-brand-600 focus:ring-brand-500"
              />
              {JOB_TYPE_LABELS[jt]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Location</label>
        <select
          name="state"
          defaultValue={state}
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm bg-white focus:border-brand-500"
        >
          <option value="all">All India</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900 mb-2">Age</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minAge"
            defaultValue={minAge}
            placeholder="Min age"
            min={15}
            max={65}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500"
          />
          <input
            type="number"
            name="maxAge"
            defaultValue={maxAge}
            placeholder="Max age"
            min={15}
            max={65}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-900 mb-2">Last Date</legend>
        <select
          name="lastDate"
          defaultValue={lastDate}
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm bg-white focus:border-brand-500"
        >
          <option value="">Any time</option>
          <option value="today">Last Date Today</option>
          <option value="week">Last Date This Week</option>
          <option value="month">Last Date This Month</option>
          <option value="upcoming">Upcoming Last Dates</option>
        </select>
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Find My Eligible Jobs
        </button>
        <a
          href="/jobs"
          className="rounded-lg border border-ink-900/15 px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 transition-colors"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
