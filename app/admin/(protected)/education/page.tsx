"use client";

import { useEffect, useState, type FormEvent } from "react";

const EDUCATION_CATEGORIES = [
  { value: "ug", label: "UG Entrance Exams" },
  { value: "pg", label: "PG Entrance Exams" },
  { value: "mba-management", label: "MBA / Management" },
  { value: "phd-research", label: "PhD / Research" },
  { value: "medical-health", label: "Medical / Health" },
  { value: "engineering-architecture", label: "Engineering / Architecture" },
  { value: "law", label: "Law Entrance Exams" },
  { value: "teaching", label: "Teaching / Education" },
  { value: "design-arts", label: "Design & Arts" },
  { value: "agriculture", label: "Agriculture & Allied Admissions" },
] as const;

type EducationItem = {
  id: number;
  title: string;
  education_category: string | null;
  organization: string | null;
  description: string | null;
  eligibility: string | null;
  start_date: string | null;
  last_date: string | null;
  exam_date: string | null;
  application_start_display: string | null;
  application_end_display: string | null;
  exam_date_display: string | null;
  academic_year: string | null;
  status_as_of: string | null;
  item_url: string | null;
  apply_url: string | null;
  cap_url: string | null;
  official_website_url: string | null;
  is_new: boolean;
};

const emptyForm = {
  title: "",
  education_category: "ug",
  organization: "",
  description: "",
  eligibility: "",
  start_date: "",
  last_date: "",
  exam_date: "",
  application_start_display: "",
  application_end_display: "",
  exam_date_display: "",
  academic_year: "2026-27",
  status_as_of: "date_awaited",
  item_url: "",
  apply_url: "",
  cap_url: "",
  official_website_url: "",
  is_new: false,
};

function dateInput(value: string | null | undefined) {
  return value ? String(value).slice(0, 10) : "";
}

export default function ManageEducationPage() {
  const [items, setItems] = useState<EducationItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function loadItems() {
    try {
      const response = await fetch("/api/site-updates?category=education", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Education records load nahi hue");
      setItems(Array.isArray(data.updates) ? data.updates : []);
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Education records load nahi hue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function beginEdit(item: EducationItem) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      education_category: item.education_category || "ug",
      organization: item.organization || "",
      description: item.description || "",
      eligibility: item.eligibility || "",
      start_date: dateInput(item.start_date),
      last_date: dateInput(item.last_date),
      exam_date: dateInput(item.exam_date),
      application_start_display: item.application_start_display || "",
      application_end_display: item.application_end_display || "",
      exam_date_display: item.exam_date_display || "",
      academic_year: item.academic_year || "",
      status_as_of: item.status_as_of || "date_awaited",
      item_url: item.item_url || "",
      apply_url: item.apply_url || "",
      cap_url: item.cap_url || "",
      official_website_url: item.official_website_url || "",
      is_new: item.is_new === true,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError(false);

    const payload = {
      category: "education",
      ...form,
    };

    try {
      const response = await fetch(
        editingId ? `/api/site-updates?id=${editingId}` : "/api/site-updates",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Education exam save nahi hua");

      if (editingId) {
        setItems((current) => current.map((item) => item.id === editingId ? data.update : item));
        setMessage("Education exam successfully update ho gaya.");
      } else {
        setItems((current) => [data.update, ...current]);
        setMessage("Education exam successfully add ho gaya.");
      }
      resetForm();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Education exam save nahi hua");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Kya aap ye entrance exam record delete karna chahte hain?")) return;
    setMessage("");
    setError(false);
    try {
      const response = await fetch(`/api/site-updates?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Record delete nahi hua");
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      setMessage("Education exam delete ho gaya.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Record delete nahi hua");
    }
  }

  const inputClass = "w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  const labelClass = "mb-1.5 block text-sm font-semibold text-ink-800";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">🎓 Manage Education</h1>
          <p className="mt-1 text-sm text-ink-700/70">Entrance exams, categories, dates aur official links add / edit karein.</p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{items.length} Exams</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl2 border border-ink-900/10 bg-white p-4 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-ink-900/10 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">{editingId ? "Edit Entrance Exam" : "Add New Entrance Exam"}</h2>
            <p className="mt-0.5 text-xs text-ink-700/60">Yahan se public Education page ka content update hoga.</p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-ink-900/15 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-900/5">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Exam / Entrance Test Name *</label>
            <input className={inputClass} value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="e.g. MHT CET PCM 2027" maxLength={300} required />
          </div>
          <div>
            <label className={labelClass}>Education Category *</label>
            <select className={inputClass} value={form.education_category} onChange={(e) => updateForm("education_category", e.target.value)} required>
              {EDUCATION_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Conducting University / Department</label>
            <input className={inputClass} value={form.organization} onChange={(e) => updateForm("organization", e.target.value)} placeholder="e.g. State CET Cell Maharashtra" />
          </div>
          <div>
            <label className={labelClass}>Application Start Date</label>
            <input className={inputClass} type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Application End / Last Date</label>
            <input className={inputClass} type="date" value={form.last_date} onChange={(e) => updateForm("last_date", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Exam Date</label>
            <input className={inputClass} type="date" value={form.exam_date} onChange={(e) => updateForm("exam_date", e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-saffron-200 bg-saffron-50 px-3 py-2.5 text-sm font-semibold text-saffron-700">
              <input type="checkbox" checked={form.is_new} onChange={(e) => updateForm("is_new", e.target.checked)} className="h-4 w-4 accent-orange-600" />
              Show “New Added” badge
            </label>
          </div>
          <div>
            <label className={labelClass}>Application Start Display</label>
            <input className={inputClass} value={form.application_start_display} onChange={(e) => updateForm("application_start_display", e.target.value)} placeholder="e.g. 14 Jan 2026 / See official notice" />
          </div>
          <div>
            <label className={labelClass}>Application End Display</label>
            <input className={inputClass} value={form.application_end_display} onChange={(e) => updateForm("application_end_display", e.target.value)} placeholder="e.g. 25 Mar 2026 / To be announced" />
          </div>
          <div>
            <label className={labelClass}>Exam Date Display</label>
            <input className={inputClass} value={form.exam_date_display} onChange={(e) => updateForm("exam_date_display", e.target.value)} placeholder="e.g. 28–30 Apr 2026 / Schedule awaited" />
          </div>
          <div>
            <label className={labelClass}>Academic Year</label>
            <input className={inputClass} value={form.academic_year} onChange={(e) => updateForm("academic_year", e.target.value)} placeholder="e.g. 2026-27" />
          </div>
          <div>
            <label className={labelClass}>Current Status</label>
            <select className={inputClass} value={form.status_as_of} onChange={(e) => updateForm("status_as_of", e.target.value)}>
              <option value="registration_open">Registration Open</option>
              <option value="exam_upcoming">Exam Upcoming</option>
              <option value="date_awaited">Dates Awaited</option>
              <option value="closed">Registration Closed</option>
              <option value="year_round">Year Round</option>
              <option value="university_schedule_required">University Schedule Required</option>
              <option value="university_admission_notice_published">University Admission Notice Published</option>
              <option value="department_wise_notice">Department-wise Notice</option>
              <option value="see_board_notification">See Board Notification</option>
              <option value="see_official_admission_schedule">See Official Admission Schedule</option>
              <option value="notice_published_dates_to_confirm">Notice Published – Dates to Confirm</option>
              <option value="cap_admission_route">CAP Admission Route</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>CAP / Admission Link</label>
            <input className={inputClass} type="url" value={form.cap_url} onChange={(e) => updateForm("cap_url", e.target.value)} placeholder="https://official-cap-portal.gov.in/" />
          </div>
          <div>
            <label className={labelClass}>Official Website Link</label>
            <input className={inputClass} type="url" value={form.official_website_url} onChange={(e) => updateForm("official_website_url", e.target.value)} placeholder="https://official-website.gov.in/" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Exam / Admission Details</label>
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Short description, course options, admission details..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Eligibility</label>
            <textarea className={inputClass} rows={2} value={form.eligibility} onChange={(e) => updateForm("eligibility", e.target.value)} placeholder="Qualification and eligibility conditions..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Official Notification PDF / Website URL</label>
            <input className={inputClass} type="url" value={form.item_url} onChange={(e) => updateForm("item_url", e.target.value)} placeholder="https://official-site.gov.in/notification.pdf" />
            <p className="mt-1 text-xs text-ink-700/50">Yahan official PDF ya notification page ka link paste karein.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Apply Online URL</label>
            <input className={inputClass} type="url" value={form.apply_url} onChange={(e) => updateForm("apply_url", e.target.value)} placeholder="https://official-portal.gov.in/apply" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-ink-900/10 pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-saffron-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-saffron-600 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving..." : editingId ? "Save Changes" : "+ Add Entrance Exam"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-ink-900/15 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5">Cancel</button>}
        </div>
      </form>

      {message && <p role="status" className={`rounded-lg px-4 py-3 text-sm font-medium ${error ? "bg-red-50 text-red-700" : "bg-leaf-50 text-leaf-700"}`}>{message}</p>}

      <section className="overflow-hidden rounded-xl2 border border-ink-900/10 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-900/10 px-4 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Education Records</h2>
            <p className="text-xs text-ink-700/60">Existing exams edit ya delete karein.</p>
          </div>
          <button type="button" onClick={() => { setLoading(true); void loadItems(); }} className="rounded-lg border border-ink-900/15 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-900/5">Refresh</button>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-ink-700/60">Loading education exams...</p>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-ink-800">Abhi koi Education exam add nahi hua hai.</p>
            <p className="mt-1 text-sm text-ink-700/60">Upar form se pehla exam add karein.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-900/5">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink-900">{item.title}</p>
                    {item.is_new && <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-bold text-leaf-700">NEW ADDED</span>}
                  </div>
                  <p className="mt-1 text-xs text-ink-700/60">{EDUCATION_CATEGORIES.find((category) => category.value === item.education_category)?.label || item.education_category || "Uncategorized"}</p>
                  <p className="mt-1 text-xs text-ink-700/60">
                    Start: {item.application_start_display || dateInput(item.start_date) || "—"} · Last date: {item.application_end_display || dateInput(item.last_date) || "—"} · Exam: {item.exam_date_display || dateInput(item.exam_date) || "—"} · {item.academic_year || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => beginEdit(item)} className="rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">Edit</button>
                  <button type="button" onClick={() => void handleDelete(item.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
