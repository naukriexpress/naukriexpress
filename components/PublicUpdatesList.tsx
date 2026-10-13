"use client";

import { useEffect, useState } from "react";

type UpdateItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  publish_date: string | null;
  amount: string | null;
  eligibility: string | null;
  last_date: string | null;
  item_url: string | null;
  objection_url: string | null;
  apply_url: string | null;
};

export default function PublicUpdatesList({
  category,
}: {
  category: "results" | "answer-key" | "syllabus" | "scholarship";
}) {
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch(
          `/api/site-updates?category=${category}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Updates load nahi hue");
        }

        setItems(data.updates || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Updates load nahi hue"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadItems();
  }, [category]);

  if (loading) {
    return (
      <p className="mt-8 rounded-xl border bg-white p-5 text-sm text-gray-600">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="mt-8 rounded-xl border bg-white p-5 text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-xl border bg-white p-5 text-sm text-gray-600">
        Abhi koi update publish nahi kiya gaya hai. Kripya baad mein check karein.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-sm"
        >
          <h2 className="break-words text-lg font-bold text-ink-900">
            {item.title}
          </h2>

          {item.organization && (
            <p className="mt-1 text-sm text-ink-700/70">
              {item.organization}
            </p>
          )}

          {item.description && (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-ink-800">
              {item.description}
            </p>
          )}

          {item.amount && (
            <p className="mt-2 text-sm">
              <strong>Scholarship Amount:</strong> {item.amount}
            </p>
          )}

          {item.eligibility && (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">
              <strong>Eligibility:</strong> {item.eligibility}
            </p>
          )}

          {item.publish_date && (
            <p className="mt-2 text-xs text-ink-700/70">
              Date: {String(item.publish_date).slice(0, 10)}
            </p>
          )}

          {item.last_date && (
            <p className="mt-2 text-sm font-medium text-red-700">
              Last Date: {String(item.last_date).slice(0, 10)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {item.item_url && (
              <a
                href={item.item_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                {category === "scholarship"
                  ? "Official Notification"
                  : category === "syllabus"
                    ? "View Syllabus / PDF"
                    : category === "answer-key"
                      ? "View Answer Key"
                      : "Check Result"}
              </a>
            )}

            {item.objection_url && (
              <a
                href={item.objection_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-ink-900/20 px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-gray-50"
              >
                Submit Objection
              </a>
            )}

            {item.apply_url && (
              <a
                href={item.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Apply Online
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
