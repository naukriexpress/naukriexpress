"use client";

import { useEffect, useState } from "react";

type AnswerKeyItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  publish_date: string | null;
  item_url: string | null;
  objection_url: string | null;
};

export default function ManageAnswerKeyPage() {
  const [items, setItems] = useState<AnswerKeyItem[]>([]);
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [keyType, setKeyType] = useState("Final Answer Key");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [objectionUrl, setObjectionUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    try {
      const response = await fetch(
        "/api/site-updates?category=answer-key",
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Answer Keys load nahi hui");
      }

      setItems(data.updates || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Answer Keys load nahi hui"
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
          category: "answer-key",
          title,
          organization,
          description: `${keyType}${description.trim() ? ` — ${description.trim()}` : ""}`,
          publish_date: publishDate,
          item_url: itemUrl,
          objection_url: objectionUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Answer Key save nahi hui");
      }

      setItems((current) => [data.update, ...current]);
      setTitle("");
      setOrganization("");
      setKeyType("Final Answer Key");
      setDescription("");
      setPublishDate("");
      setItemUrl("");
      setObjectionUrl("");
      setMessage("Answer Key successfully add ho gayi!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Answer Key save nahi hui"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Kya aap ye Answer Key delete karna chahte hain?")) {
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
      setMessage("Answer Key delete ho gayi.");
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
          📝 Manage Answer Key
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Provisional aur final answer keys ke links manage karein.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Exam / Answer Key Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. SSC CGL Answer Key 2026"
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
            placeholder="e.g. Staff Selection Commission"
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Answer Key Type *
          </label>
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value)}
            className="w-full rounded-lg border p-3 text-gray-900"
          >
            <option>Provisional Answer Key</option>
            <option>Final Answer Key</option>
            <option>Response Sheet</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Details / Objection Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exam details, objection instructions, etc."
            rows={3}
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
            Official Answer Key / PDF Link *
          </label>
          <input
            type="url"
            value={itemUrl}
            onChange={(e) => setItemUrl(e.target.value)}
            placeholder="https://official-website.gov.in/answer-key"
            required
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Objection Link (Optional)
          </label>
          <input
            type="url"
            value={objectionUrl}
            onChange={(e) => setObjectionUrl(e.target.value)}
            placeholder="https://official-website.gov.in/objection"
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Answer Key"}
        </button>
      </form>

      {message && (
        <p role="status" className="rounded-lg bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Added Answer Keys</h2>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">
            Abhi koi Answer Key add nahi ki gayi hai.
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
                    <p className="mt-1 break-words text-sm text-gray-600">
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
                      Open Answer Key
                    </a>
                  )}

                  {item.objection_url && (
                    <a
                      href={item.objection_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-all text-sm text-blue-600 underline"
                    >
                      Open Objection Link
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
