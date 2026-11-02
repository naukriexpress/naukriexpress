"use client";

import { CATEGORY_LABELS, JOB_TYPE_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { Category, JobType, Qualification } from "@/lib/types";

type SP = Record<string, string | string[] | undefined>;

function values(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function value(value: string | string[] | undefined, fallback = ""): string {
  return Array.isArray(value) ? value[0] || fallback : value || fallback;
}

const CATEGORIES: Category[] = ["open", "obc", "sc", "st", "ews"];
const QUALIFICATIONS: Qualification[] = [
  "10th", "12th", "iti", "diploma", "graduate", "post_graduate",
  "engineering", "law", "medical", "any_graduate",
];
const JOB_TYPES: JobType[] = [
  "government", "private", "contract", "apprenticeship", "internship",
];

function CloseFilterPopover() {
  return (
    <div className="jobs-filter-popover-footer">
      <button
        type="button"
        className="jobs-filter-close"
        onClick={(event) => {
          const dropdown = event.currentTarget.closest("details");
          if (dropdown) dropdown.open = false;
        }}
      >
        Close
      </button>
    </div>
  );
}

export default function JobsFilterToolbar({
  searchParams,
  states,
}: {
  searchParams: SP;
  states: string[];
}) {
  const gender = value(searchParams.gender, "all");
  const categories = values(searchParams.categories);
  const qualifications = values(searchParams.qualifications);
  const jobTypes = values(searchParams.jobType);
  const state = value(searchParams.state, "all");
  const minAge = value(searchParams.minAge);
  const maxAge = value(searchParams.maxAge);
  const lastDate = value(searchParams.lastDate);
  const q = value(searchParams.q);
  const pageSize = value(searchParams.pageSize, "9");
  const sort = value(searchParams.sort, pageSize === "50" ? "closing_soon" : "latest");

  const resetHref = pageSize === "50" ? "/jobs?pageSize=50" : "/jobs";

  return (
    <form
      method="get"
      action="/jobs"
      className="jobs-filter-toolbar rounded-2xl border border-ink-900/10 bg-white p-3 shadow-card sm:p-4"
    >
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="pageSize" value={pageSize} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-ink-900">Filter Jobs</h2>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {pageSize === "50" ? "50 jobs per page" : "Job filters"}
        </span>
      </div>

      <div className="jobs-filter-row flex items-center gap-1.5">
        <label className="jobs-filter-search min-w-[150px] flex-1">
          <span className="sr-only">Search jobs</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search job title or organization"
            className="h-10 w-full rounded-lg border border-ink-900/15 bg-white px-3 text-sm text-ink-800 outline-none focus:border-brand-500"
          />
        </label>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Gender
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Select Gender</p>
            {[
              { value: "all", label: "All genders" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "both", label: "Male & Female (Combined)" },
            ].map((option) => (
              <label key={option.value} className="jobs-filter-option">
                <input type="radio" name="gender" value={option.value} defaultChecked={gender === option.value} />
                <span>{option.label}</span>
              </label>
            ))}
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Category
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Select Category</p>
            {CATEGORIES.map((category) => (
              <label key={category} className="jobs-filter-option">
                <input type="checkbox" name="categories" value={category} defaultChecked={categories.includes(category)} />
                <span>{CATEGORY_LABELS[category]}</span>
              </label>
            ))}
            <p className="jobs-filter-note">You can select multiple categories.</p>
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Qualification
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover jobs-filter-popover-tall">
            <p className="jobs-filter-popover-title">Select Qualification</p>
            {QUALIFICATIONS.map((qualification) => (
              <label key={qualification} className="jobs-filter-option">
                <input type="checkbox" name="qualifications" value={qualification} defaultChecked={qualifications.includes(qualification)} />
                <span>{QUALIFICATION_LABELS[qualification]}</span>
              </label>
            ))}
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Job Type
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Select Job Type</p>
            {JOB_TYPES.map((jobType) => (
              <label key={jobType} className="jobs-filter-option">
                <input type="checkbox" name="jobType" value={jobType} defaultChecked={jobTypes.includes(jobType)} />
                <span>{JOB_TYPE_LABELS[jobType]}</span>
              </label>
            ))}
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Location
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Select Location</p>
            <select name="state" defaultValue={state} className="jobs-filter-select">
              <option value="all">All India</option>
              {states.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Age
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Age Range</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-ink-700">
                Min age
                <input type="number" name="minAge" defaultValue={minAge} min={15} max={65} placeholder="15" className="jobs-filter-select mt-1" />
              </label>
              <label className="text-xs font-medium text-ink-700">
                Max age
                <input type="number" name="maxAge" defaultValue={maxAge} min={15} max={65} placeholder="65" className="jobs-filter-select mt-1" />
              </label>
            </div>
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Last Date
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Application Last Date</p>
            <select name="lastDate" defaultValue={lastDate} className="jobs-filter-select">
              <option value="">Any time</option>
              <option value="today">Last Date Today</option>
              <option value="week">Last Date This Week</option>
              <option value="month">Last Date This Month</option>
              <option value="upcoming">Upcoming Last Dates</option>
            </select>
            <CloseFilterPopover />
          </div>
        </details>

        <details className="jobs-filter-dropdown">
          <summary className="jobs-filter-trigger">
            Sort By
            <span className="jobs-filter-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="jobs-filter-popover">
            <p className="jobs-filter-popover-title">Sort Jobs</p>
            <select name="sort" defaultValue={sort} className="jobs-filter-select">
              <option value="closing_soon">Nearest last date</option>
              <option value="latest">Newest first</option>
              <option value="most_viewed">Most viewed</option>
            </select>
            <CloseFilterPopover />
          </div>
        </details>

        <button type="submit" className="h-10 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">
          Apply Filters
        </button>
        <a href={resetHref} className="inline-flex h-10 items-center rounded-lg border border-ink-900/15 px-3 text-sm font-semibold text-ink-700 hover:bg-ink-900/5">
          Reset
        </a>
      </div>
    </form>
  );
}
