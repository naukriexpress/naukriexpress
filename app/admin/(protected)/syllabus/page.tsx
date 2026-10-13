"use client";

import { useEffect, useState } from "react";

type SyllabusItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  publish_date: string | null;
  item_url: string | null;
};

export default function ManageSyllabusPage() {
  const [items, setItems] = useState<SyllabusItem[]>([]);
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    try {
      const response = await fetch(
        "/api/site-updates?category=syllabus",
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Syllabus load nahi hua");
      }

      setItems(data.updates || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Syllabus load nahi hua"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/site-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "syllabus",
          title,
          organization,
          description,
          publish_date: publishDate,
          item_url: itemUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Syllabus save nahi hua");
      }

      setItems((current) => [data.update, ...current]);
      setTitle("");
      setOrganization("");
      setDescription("");
      setPublishDate("");
      setItemUrl("");
      setMessage("Syllabus successfully add ho gaya!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Syllabus save nahi hua"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Kya aap ye syllabus delete karna chahte hain?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`/api/site-updates?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete nahi hua");
      }

      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("Syllabus delete ho gaya.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Delete nahi hua"
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          📚 Manage Syllabus
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Exam syllabus, exam pattern aur official PDF links add karein.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Exam / Syllabus Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MPSC Group B Syllabus 2026"
            maxLength={300}
            required
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Organization / Department
          </label>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Maharashtra Public Service Commission"
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Syllabus Details / Exam Pattern
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Subjects, marks, exam pattern, stages, etc."
            rows={5}
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Publication Date
          </label>
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Official Syllabus / PDF Link *
          </label>
          <input
            type="url"
            value={itemUrl}
            onChange={(e) => setItemUrl(e.target.value)}
            placeholder="https://official-website.gov.in/syllabus.pdf"
            required
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Syllabus"}
        </button>
      </form>

      {message && (
        <p role="status" className="rounded-lg bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Added Syllabus</h2>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">
            Abhi koi syllabus add nahi kiya gaya hai.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="break-words font-semibold">{item.title}</p>

                  {item.organization && (
                    <p className="text-sm text-gray-600">
                      {item.organization}
                    </p>
                  )}

                  {item.description && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {item.publish_date && (
                    <p className="text-sm text-gray-500">
                      Date: {String(item.publish_date).slice(0, 10)}
                    </p>
                  )}

                  {item.item_url && (
                    <a
                      href={item.item_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-all text-sm text-blue-600 underline"
                    >
                      Open Syllabus PDF
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
