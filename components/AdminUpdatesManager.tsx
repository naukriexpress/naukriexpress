"use client";

import { useEffect, useState } from "react";

type UpdateStatus = "draft" | "published" | "scheduled";

type Announcement = {
  id: string;
  title: string;
  message: string;
  status: UpdateStatus;
  pinned: boolean;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  title: "",
  message: "",
  status: "published" as UpdateStatus,
  pinned: false,
  publishAt: "",
};

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: UpdateStatus) {
  if (status === "published") return "Published";
  if (status === "scheduled") return "Scheduled";
  return "Draft";
}

export default function AdminUpdatesManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin-updates?manage=1", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Updates could not be loaded.");
        return data;
      })
      .then((data: { items?: Announcement[] }) => {
        if (active) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((error: unknown) => {
        if (active) setNotice(error instanceof Error ? error.message : "Updates could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(item: Announcement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      message: item.message,
      status: item.status,
      pinned: item.pinned,
      publishAt: toLocalDateTime(item.publishAt),
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function persist(nextItems: Announcement[]) {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: nextItems }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Updates could not be saved.");
      setItems(Array.isArray(data.items) ? data.items : nextItems);
      setNotice("Announcement successfully saved.");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Updates could not be saved.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const message = form.message.trim();

    if (!title || !message) {
      setNotice("Please enter both title and full message.");
      return;
    }
    if (form.status === "scheduled" && !form.publishAt) {
      setNotice("Please select the publish date and time.");
      return;
    }

    const savedAt = form.status === "scheduled"
      ? new Date(form.publishAt).toISOString()
      : null;
    const existing = editingId ? items.find((item) => item.id === editingId) : undefined;
    const record: Announcement = {
      id: editingId || crypto.randomUUID(),
      title,
      message,
      status: form.status,
      pinned: form.pinned,
      publishAt: savedAt,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextItems = editingId
      ? items.map((item) => item.id === editingId ? record : item)
      : [record, ...items];

    const ok = await persist(nextItems);
    if (ok) resetForm();
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this announcement permanently?")) return;
    const ok = await persist(items.filter((item) => item.id !== id));
    if (ok && editingId === id) resetForm();
  }

  async function togglePin(item: Announcement) {
    const nextItems = items.map((current) =>
      current.id === item.id ? { ...current, pinned: !current.pinned } : current
    );
    await persist(nextItems);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">NaukriExpress Updates</h1>
          <p className="mt-1 text-sm text-ink-700/70">
            Create read-only announcements for every website visitor.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          Admin publishing controls
        </span>
      </div>

      <form id="new-message" onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-ink-900">
            {editingId ? "Edit Announcement" : "Create Announcement"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-brand-700 hover:underline">
              + New announcement
            </button>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-900">Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
            maxLength={140}
            required
            placeholder="e.g. MahaDBT Form Last Date Update"
            className="w-full rounded-lg border border-ink-900/15 bg-white px-3 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
          />
          <span className="mt-1 block text-right text-xs text-ink-700/60">{form.title.length}/140</span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-900">Full Message</span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))}
            rows={7}
            maxLength={6000}
            required
            placeholder="Type the complete announcement here. You can add dates, instructions and links."
            className="w-full resize-y rounded-lg border border-ink-900/15 bg-white px-3 py-3 text-sm leading-relaxed text-ink-900 focus:border-brand-500 focus:outline-none"
          />
          <span className="mt-1 block text-right text-xs text-ink-700/60">{form.message.length}/6000</span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-900">Publishing Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((value) => ({ ...value, status: event.target.value as UpdateStatus }))}
              className="w-full rounded-lg border border-ink-900/15 bg-white px-3 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Immediately</option>
              <option value="scheduled">Schedule Publishing</option>
            </select>
          </label>

          {form.status === "scheduled" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-900">Publish Date &amp; Time</span>
              <input
                type="datetime-local"
                value={form.publishAt}
                onChange={(event) => setForm((value) => ({ ...value, publishAt: event.target.value }))}
                required
                className="w-full rounded-lg border border-ink-900/15 bg-white px-3 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
              />
            </label>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-800">
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(event) => setForm((value) => ({ ...value, pinned: event.target.checked }))}
            className="h-4 w-4 rounded border-ink-900/30 text-brand-600"
          />
          Pin this announcement at the top
        </label>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-900/10 pt-4">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-brand-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Save Announcement"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={saving} className="rounded-lg border border-ink-900/15 px-4 py-3 text-sm font-semibold text-ink-800 hover:bg-ink-900/5">
              Cancel
            </button>
          )}
          <span role="status" className="text-sm text-ink-700/70">{notice}</span>
        </div>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink-900">All Announcements</h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{items.length} total</span>
        </div>
        {loading ? (
          <div className="rounded-xl border border-ink-900/10 bg-white p-5 text-sm text-ink-700/70">Loading announcements…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-900/20 bg-white p-6 text-center">
            <p className="font-semibold text-ink-900">No announcements yet</p>
            <p className="mt-1 text-sm text-ink-700/70">Create the first announcement using the form above.</p>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-xl border border-ink-900/10 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-ink-900">{item.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === "published" ? "bg-emerald-50 text-emerald-800" : item.status === "scheduled" ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                      {statusLabel(item.status)}
                    </span>
                    {item.pinned && <span className="text-xs font-semibold text-amber-700">📌 Pinned</span>}
                  </div>
                  <p className="mt-1 text-xs text-ink-700/60">
                    {item.status === "scheduled" ? `Publish: ${formatDate(item.publishAt)}` : `Created: ${formatDate(item.createdAt)}`}
                  </p>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">{item.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">Edit</button>
                  <button type="button" onClick={() => togglePin(item)} disabled={saving} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">{item.pinned ? "Unpin" : "Pin"}</button>
                  <button type="button" onClick={() => deleteItem(item.id)} disabled={saving} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
