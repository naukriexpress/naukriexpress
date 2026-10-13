"use client";

import { useState, useEffect } from "react";

type AdmitCardLink = {
  id: number;
  title: string;
  url: string;
};

export default function AdminAdmitCardPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<AdmitCardLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLinks() {
    try {
      const response = await fetch("/api/admit-cards", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Links load nahi hue");
      }

      setLinks(data.links || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Links load nahi hue"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLinks();
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Link save nahi hua");
      }

      setLinks((current) => [data.link, ...current]);
      setTitle("");
      setUrl("");
      setMessage("Admit Card link successfully save ho gaya!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Link save nahi hua"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Kya aap is Admit Card link ko delete karna chahte hain?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`/api/admit-cards?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Link delete nahi hua");
      }

      setLinks((current) => current.filter((item) => item.id !== id));
      setMessage("Admit Card link delete ho gaya.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Delete nahi hua"
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Manage Admit Card Links
      </h1>

      <form
        onSubmit={handleAdd}
        className="mb-6 space-y-4 rounded-xl border bg-white p-4 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admit Card Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bombay High Court Clerk Admit Card 2026"
            maxLength={300}
            className="w-full rounded-lg border p-2 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admit Card Link (URL)
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/admit-card"
            className="w-full rounded-lg border p-2 text-gray-900"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-saffron-600 px-4 py-2 font-semibold text-white hover:bg-saffron-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Admit Card Link"}
        </button>
      </form>

      {message && (
        <p className="mb-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
          {message}
        </p>
      )}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          Active Admit Cards
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-gray-500">
            No admit cards added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-gray-50 p-3"
              >
                <div className="min-w-0">
                  <p className="break-words font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all text-sm text-blue-600 underline"
                  >
                    {item.url}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="shrink-0 rounded border border-red-200 px-3 py-1 text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
