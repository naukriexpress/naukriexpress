"use client";

import { useEffect, useState, type FormEvent } from "react";

type EducationItem = {
  id: number;
  title: string;
  education_category: string | null;
  start_date: string | null;
  last_date: string | null;
  item_url: string | null;
  apply_url: string | null;
  cap_url: string | null;
  official_website_url: string | null;
};

type EditForm = {
  start_date: string;
  last_date: string;
  item_url: string;
  apply_url: string;
  cap_url: string;
  official_website_url: string;
};

const emptyForm: EditForm = {
  start_date: "",
  last_date: "",
  item_url: "",
  apply_url: "",
  cap_url: "",
  official_website_url: "",
};

const categories: Record<string, string> = {
  ug: "UG Entrance Exams",
  pg: "PG Entrance Exams",
  "mba-management": "MBA / Management",
  "phd-research": "PhD / Research",
  "medical-health": "Medical / Health",
  "engineering-architecture": "Engineering / Architecture",
  law: "Law Entrance Exams",
  teaching: "Teaching / Education",
  "design-arts": "Design & Arts",
  agriculture: "Agriculture & Allied Admissions",
};

function dateInput(value: string | null | undefined) {
  return value ? String(value).slice(0, 10) : "";
}

export default function ManageEducationPage() {
  const [items, setItems] = useState<EducationItem[]>([]);
  const [form, setForm] = useState<EditForm>(emptyForm);
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

  useEffect(() => { void loadItems(); }, []);

  function updateForm<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function beginEdit(item: EducationItem) {
    setEditingId(item.id);
    setForm({
      start_date: dateInput(item.start_date),
      last_date: dateInput(item.last_date),
      item_url: item.item_url || "",
      apply_url: item.apply_url || "",
      cap_url: item.cap_url || "",
      official_website_url: item.official_website_url || "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(`/api/site-updates?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Dates / links update nahi hue");
      setItems((current) => current.map((item) => item.id === editingId ? data.update : item));
      cancelEdit();
      setMessage("Dates aur links successfully update ho gaye.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Update save nahi hua");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  const labelClass = "mb-1.5 block text-sm font-semibold text-ink-800";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">🎓 Manage Education</h1>
          <p className="mt-1 text-sm text-ink-700/70">Exam details GitHub par fixed hain. Yahan sirf dates aur official links update karein.</p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{items.length} Exams</span>
      </div>

      {editingId !== null && (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl2 border border-brand-200 bg-white p-4 shadow-card sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Edit Dates & Official Links</h2>
              <p className="mt-1 text-sm text-ink-700/60">{items.find((item) => item.id === editingId)?.title}</p>
            </div>
            <button type="button" onClick={cancelEdit} className="rounded-lg border border-ink-900/15 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-900/5">Cancel</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Application Start Date</label>
              <input className={inputClass} type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Application Last Date</label>
              <input className={inputClass} type="date" value={form.last_date} onChange={(e) => updateForm("last_date", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Official Notification PDF / Page URL</label>
              <input className={inputClass} type="url" value={form.item_url} onChange={(e) => updateForm("item_url", e.target.value)} placeholder="https://official-site.gov.in/notification.pdf" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Apply Online URL</label>
              <input className={inputClass} type="url" value={form.apply_url} onChange={(e) => updateForm("apply_url", e.target.value)} placeholder="https://official-portal.gov.in/apply" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>CAP / College Admission URL</label>
              <input className={inputClass} type="url" value={form.cap_url} onChange={(e) => updateForm("cap_url", e.target.value)} placeholder="https://official-cap-portal.gov.in/" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Official Website URL</label>
              <input className={inputClass} type="url" value={form.official_website_url} onChange={(e) => updateForm("official_website_url", e.target.value)} placeholder="https://official-website.gov.in/" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-ink-900/10 pt-4">
            <button type="submit" disabled={saving} className="rounded-lg bg-saffron-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-saffron-600 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save Dates & Links"}</button>
            <button type="button" onClick={cancelEdit} className="rounded-lg border border-ink-900/15 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-900/5">Cancel</button>
          </div>
        </form>
      )}

      {message && <p role="status" className={`rounded-lg px-4 py-3 text-sm font-medium ${error ? "bg-red-50 text-red-700" : "bg-leaf-50 text-leaf-700"}`}>{message}</p>}

      <section className="overflow-hidden rounded-xl2 border border-ink-900/10 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-900/10 px-4 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">GitHub Education Directory</h2>
            <p className="text-xs text-ink-700/60">Fixed exam information is stored in GitHub. Select Edit to change only dates and URLs.</p>
          </div>
          <button type="button" onClick={() => { setLoading(true); void loadItems(); }} className="rounded-lg border border-ink-900/15 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-900/5">Refresh</button>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-ink-700/60">Loading education exams...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-700/60">Education records available nahi hain.</p>
        ) : (
          <div className="divide-y divide-ink-900/5">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-1 text-xs text-ink-700/60">{categories[item.education_category || ""] || item.education_category || "Uncategorized"}</p>
                  <p className="mt-1 text-xs text-ink-700/60">Start: {dateInput(item.start_date) || "—"} · Last date: {dateInput(item.last_date) || "—"}</p>
                </div>
                <button type="button" onClick={() => beginEdit(item)} className="self-start rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">Edit Dates / Links</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
