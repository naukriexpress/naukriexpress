"use client";

import { CATEGORY_LABELS, JOB_TYPE_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { Category, JobPosting, JobType, Qualification } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import VacancyRowsEditor from "./VacancyRowsEditor";
import { JOB_LOCATION_OPTIONS } from "@/lib/locations";
import { stripChatGptUtmSource } from "@/lib/url-utils";


const CATEGORIES: Category[] = ["open", "obc", "sc", "st", "ews"];
const QUALIFICATIONS: Qualification[] = [
  "10th", "12th", "iti", "diploma", "graduate", "post_graduate", "engineering", "law", "medical", "any_graduate",
];
const JOB_TYPES: JobType[] = ["government", "private", "contract", "apprenticeship", "internship"];
const STATES = JOB_LOCATION_OPTIONS;

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-6 shadow-card">
      <h2 className="font-display text-base font-bold text-ink-900">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-ink-700/60">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

export default function JobForm({
  action,
  job,
  submitLabel = "Publish Job",
}: {
  action: (formData: FormData) => void;
  job?: JobPosting;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {/* Basic Information */}
      <Section title="Basic Information" hint="The core details candidates see first.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Job Title" required>
            <input name="title" defaultValue={job?.title} required placeholder="e.g. Maharashtra Police Constable Recruitment 2026" className={inputCls} />
          </Field>
          <Field label="Organization Name" required>
            <input name="organization" defaultValue={job?.organization} required placeholder="e.g. Maharashtra Police Department" className={inputCls} />
          </Field>
          <Field label="Department">
            <input name="department" defaultValue={job?.department} placeholder="e.g. Home Department, Govt. of Maharashtra" className={inputCls} />
          </Field>
          <Field label="Advertisement Number">
            <input name="advertisementNumber" defaultValue={job?.advertisementNumber} placeholder="e.g. MAHA-POL/2026/07" className={inputCls} />
          </Field>
          <Field label="Total Vacancies" required>
            <input name="totalVacancies" type="number" min={0} defaultValue={job?.totalVacancies} required placeholder="e.g. 8200" className={inputCls} />
          </Field>
          <Field label="Job Type">
            <select name="jobType" defaultValue={job?.jobType || "government"} className={inputCls}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="State">
            <select name="state" defaultValue={job?.location.state || "Maharashtra"} className={inputCls}>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="District (optional)">
            <input name="district" defaultValue={job?.location.district} placeholder="e.g. Pune" className={inputCls} />
          </Field>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm text-ink-800">
              <input type="checkbox" name="allIndia" defaultChecked={job?.location.allIndia} className="h-4 w-4 rounded border-ink-900/30 text-brand-600" />
              This is an All India vacancy
            </label>
          </div>
        </div>
      </Section>

      {/* Eligibility */}
      <Section title="Eligibility" hint="Checkboxes here directly control who sees this job in filters — no code changes needed.">
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5">Gender</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-800">
              <input type="checkbox" name="gender" value="male" defaultChecked={job ? job.eligibility.genders.includes("male") : true} className="h-4 w-4 rounded border-ink-900/30 text-brand-600" />
              Male
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-800">
              <input type="checkbox" name="gender" value="female" defaultChecked={job ? job.eligibility.genders.includes("female") : true} className="h-4 w-4 rounded border-ink-900/30 text-brand-600" />
              Female
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5">Category</label>
          <div className="flex flex-wrap gap-4">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-ink-800">
                <input
                  type="checkbox"
                  name="category"
                  value={c}
                  defaultChecked={job ? job.eligibility.categories.includes(c) : true}
                  className="h-4 w-4 rounded border-ink-900/30 text-brand-600"
                />
                {CATEGORY_LABELS[c]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5">Qualification (select all that apply)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUALIFICATIONS.map((q) => (
              <label key={q} className="flex items-center gap-2 text-sm text-ink-800">
                <input
                  type="checkbox"
                  name="qualification"
                  value={q}
                  defaultChecked={job?.eligibility.qualifications.includes(q)}
                  className="h-4 w-4 rounded border-ink-900/30 text-brand-600"
                />
                {QUALIFICATION_LABELS[q]}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Minimum Age">
            <input name="minAge" type="number" min={0} max={65} defaultValue={job?.eligibility.minAge} placeholder="e.g. 18" className={inputCls} />
          </Field>
          <Field label="Maximum Age">
            <input name="maxAge" type="number" min={0} max={65} defaultValue={job?.eligibility.maxAge} placeholder="e.g. 28" className={inputCls} />
          </Field>
          <Field label="Age Relaxation">
            <input name="ageRelaxation" defaultValue={job?.eligibility.ageRelaxation} placeholder="e.g. 5 yrs for OBC/SC/ST" className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* Vacancy breakdown */}
      <Section title="Post-wise Vacancy Table" hint="Add one row per post. This generates the public vacancy table.">
        <VacancyRowsEditor defaultRows={job?.vacancyBreakdown} />
      </Section>

      {/* Important details */}
      <Section title="Important Details">
        <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          <input
            type="checkbox"
            name="noticeDetailsPending"
            defaultChecked={Boolean(job?.noticeDetailsPending)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Official notice details are pending (hide placeholder dates and vacancy count until confirmed).
          </span>
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Application Start Date">
            <input name="startDate" type="date" defaultValue={job?.dates.startDate} className={inputCls} />
          </Field>
          <Field label="Last Date to Apply" required>
            <input name="lastDate" type="date" defaultValue={job?.dates.lastDate} required className={inputCls} />
          </Field>
          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-800">
              <input
                type="checkbox"
                name="lastDateExtended"
                defaultChecked={Boolean(job?.lastDateExtended)}
                className="h-4 w-4"
              />
              Last Date Extended
            </label>
          </div>
          <Field label="Exam Date">
            <input name="examDate" type="date" defaultValue={job?.dates.examDate} className={inputCls} />
          </Field>
          <Field label="Application Fee">
            <input name="applicationFee" defaultValue={job?.applicationFee} placeholder="e.g. ₹450 (Open/OBC), ₹350 (SC/ST)" className={inputCls} />
          </Field>
          <Field label="Salary / Pay Scale">
            <input name="salary" defaultValue={job?.salary} placeholder="e.g. ₹29,200 – ₹92,300" className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* Links */}
      <Section title="Links" hint="The utm_source=chatgpt.com tracking parameter is automatically removed from these three links.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Apply Online Link">
            <input name="applyOnline" type="url" defaultValue={stripChatGptUtmSource(job?.links.applyOnline)} onBlur={(event) => { event.currentTarget.value = stripChatGptUtmSource(event.currentTarget.value); }} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Official Notification Link (PDF)">
            <input name="officialNotification" type="url" defaultValue={stripChatGptUtmSource(job?.links.officialNotification)} onBlur={(event) => { event.currentTarget.value = stripChatGptUtmSource(event.currentTarget.value); }} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Official Website Link">
            <input name="officialWebsite" type="url" defaultValue={stripChatGptUtmSource(job?.links.officialWebsite)} onBlur={(event) => { event.currentTarget.value = stripChatGptUtmSource(event.currentTarget.value); }} placeholder="https://..." className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* Content */}
      <Section title="Content" hint="Use normal rich text, or enter one item per line as Label | Value to show a specification-style table on the public page.">
        <RichTextEditor name="content_eligibility" label="Eligibility Details" defaultValue={job?.content.eligibility} placeholder="Example: Model Number | WM118 (one Label | Value item per line)" />
      </Section>

      {/* SEO */}
      <Section title="SEO (optional)" hint="Leave blank to auto-generate from the job title.">
        <Field label="SEO Title">
          <input name="seoTitle" defaultValue={job?.seo.title} placeholder="Custom page title for search engines" className={inputCls} />
        </Field>
        <Field label="Meta Description">
          <textarea name="seoDescription" defaultValue={job?.seo.metaDescription} rows={2} placeholder="Short summary shown in Google search results" className={inputCls} />
        </Field>
      </Section>

      {/* Publishing */}
      <Section title="Publishing">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
          <input type="checkbox" name="featured" value="on" defaultChecked={job?.featured} className="h-4 w-4 rounded border-ink-900/30 text-brand-600" />
          Mark as Featured Job
        </label>

        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-1.5">Publish Mode</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
              <input type="radio" name="publishMode" value="publish" defaultChecked={!job || job.status === "published" || job.status === "expired"} className="h-4 w-4 text-brand-600" />
              Publish Immediately
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
              <input type="radio" name="publishMode" value="draft" defaultChecked={job?.status === "draft"} className="h-4 w-4 text-brand-600" />
              Save as Draft
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
              <input type="radio" name="publishMode" value="schedule" defaultChecked={job?.status === "scheduled"} className="h-4 w-4 text-brand-600" />
              Schedule Publishing
            </label>
          </div>
        </div>

        <Field label="Scheduled Publish Date & Time (if scheduling)">
          <input
            name="publishAt"
            type="datetime-local"
            defaultValue={job?.publishAt ? job.publishAt.slice(0, 16) : undefined}
            className={inputCls}
          />
        </Field>
      </Section>

      <div className="flex items-center gap-3 pb-8">
        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
          {submitLabel}
        </button>
        <a href="/admin/jobs" className="rounded-lg border border-ink-900/15 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
