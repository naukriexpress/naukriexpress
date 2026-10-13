"use client";

import { useEffect, useState } from "react";

type ScholarshipItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  amount: string | null;
  eligibility: string | null;
  last_date: string | null;
  item_url: string | null;
  apply_url: string | null;
};

export default function ManageScholarshipPage() {
  const [items, setItems] = useState<ScholarshipItem[]>([]);
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    try {
      const response = await fetch(
        "/api/site-updates?category=scholarship",
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scholarships load nahi hui");
      }

      setItems(data.updates || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Scholarships load nahi hui"
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
          category: "scholarship",
          title,
          organization,
          description,
          amount,
          eligibility,
          last_date: lastDate,
          item_url: itemUrl,
          apply_url: applyUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scholarship save nahi hui");
      }

      setItems((current) => [data.update, ...current]);
      setTitle("");
      setOrganization("");
      setDescription("");
      setAmount("");
      setEligibility("");
      setLastDate("");
      setItemUrl("");
      setApplyUrl("");
      setMessage("Scholarship successfully add ho gayi!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Scholarship save nahi hui"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Kya aap ye scholarship delete karna chahte hain?")) {
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
      setMessage("Scholarship delete ho gayi.");
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
          🎓 Manage Scholarship
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Scholarship details, eligibility aur application links manage karein.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Scholarship Name *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Post Matric Scholarship 2026"
            maxLength={300}
            required
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Provider / Department
          </label>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Government of Maharashtra"
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Scholarship Details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scheme details, benefits and important information"
            rows={4}
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Scholarship Amount / Benefits
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. Up to ₹20,000 per year"
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Eligibility
          </label>
          <textarea
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            placeholder="Education, income limit, category and other requirements"
            rows={3}
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Last Date to Apply
          </label>
          <input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Official Notification / Details Link
          </label>
          <input
            type="url"
            value={itemUrl}
            onChange={(e) => setItemUrl(e.target.value)}
            placeholder="https://official-website.gov.in/notification"
            className="w-full rounded-lg border p-3 text-gray-900"
          />
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <label className="mb-1 block text-sm font-semibold text-green-900">
            Apply Online Link *
          </label>
          <p className="mb-2 text-xs text-green-800">
            Students ko application form bharne ke liye is link par bheja jayega.
          </p>
          <input
            type="url"
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="https://official-portal.gov.in/apply"
            required
            className="w-full rounded-lg border border-green-300 bg-white p-3 text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Scholarship"}
        </button>
      </form>

      {message && (
        <p role="status" className="rounded-lg bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Added Scholarships</h2>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">
            Abhi koi scholarship add nahi ki gayi hai.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">{item.title}</p>

                    {item.organization && (
                      <p className="text-sm text-gray-600">
                        {item.organization}
                      </p>
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

                {item.amount && (
                  <p className="mt-2 text-sm">
                    <strong>Amount:</strong> {item.amount}
                  </p>
                )}

                {item.eligibility && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                    <strong>Eligibility:</strong> {item.eligibility}
                  </p>
                )}

                {item.last_date && (
                  <p className="mt-1 text-sm">
                    <strong>Last Date:</strong>{" "}
                    {String(item.last_date).slice(0, 10)}
                  </p>
                )}

                {item.item_url && (
                  <a
                    href={item.item_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-sm text-blue-600 underline"
                  >
                    Official Notification
                  </a>
                )}

                {item.apply_url && (
                  <a
                    href={item.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-lg bg-green-700 px-4 py-2 font-semibold text-white"
                  >
                    Apply Online
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
