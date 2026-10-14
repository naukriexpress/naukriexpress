"use client";

import { useEffect, useState } from "react";

const DEFAULT_TEXT =
  "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";

export default function AdminTickerPage() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewItems, setPreviewItems] = useState<string[]>([]);

  useEffect(() => {
    async function loadTicker() {
      try {
        const response = await fetch("/api/ticker", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ticker load failed");
        }

        const loadedItems =
          Array.isArray(data.items) && data.items.length > 0
            ? data.items
            : typeof data.text === "string" && data.text.trim()
              ? [data.text]
              : [];

        setItems(loadedItems);
        setPreviewItems(loadedItems);
      } catch {
        setMessage("Ticker load nahi hua. Page refresh karke dekhein.");
      } finally {
        setLoading(false);
      }
    }

    loadTicker();
  }, []);

  function addItem() {
    setItems((current) => [...current, ""]);
    setMessage("");
  }

  function updateItem(index: number, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item))
    );
    setMessage("");
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setMessage("");
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const cleanedItems = items.map((item) => item.trim()).filter(Boolean);
    const totalLength = cleanedItems.join(" • ").length;

    if (cleanedItems.some((item) => item.length > 500) || totalLength > 2000) {
      setMessage("Har ticker 500 characters tak aur total text 2000 characters tak rakhein.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cleanedItems }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ticker save failed");
      }

      const savedItems = Array.isArray(data.items) ? data.items : cleanedItems;
      setItems(savedItems);
      setPreviewItems(savedItems);
      setMessage("Ticker updates save ho gaye!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ticker save nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  const preview = previewItems.length
    ? previewItems.join(" • ")
    : DEFAULT_TEXT;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage Ticker</h1>
          <p className="mt-1 text-sm text-gray-600">
            Website ke top ticker mein dikhne wale updates add ya edit karein.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={loading || saving}
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          + Add Ticker
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Loading ticker updates...
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">
            Abhi koi ticker update nahi hai. Naya update add karne ke liye button dabayein.
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <label
                htmlFor={`ticker-item-${index}`}
                className="w-20 shrink-0 pt-2 text-sm font-medium text-ink-800"
              >
                Update {index + 1}
              </label>
              <textarea
                id={`ticker-item-${index}`}
                value={item}
                onChange={(event) => updateItem(index, event.target.value)}
                placeholder="Jaise: Maharashtra mein naye apprentice jobs — Apply now"
                rows={2}
                maxLength={500}
                disabled={saving}
                className="min-w-0 flex-1 resize-y rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={saving}
                aria-label={`Remove update ${index + 1}`}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Ticker Updates"}
        </button>
        <p className="text-sm text-gray-500">
          {items.reduce((sum, item) => sum + item.length, 0)}/2000 characters
        </p>
        {message && (
          <p role="status" className="text-sm font-medium text-ink-800">
            {message}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Live Preview</h2>
        <p className="break-words text-sm">{preview}</p>
      </div>
    </div>
  );
}
