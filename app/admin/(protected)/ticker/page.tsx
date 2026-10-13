
"use client";

import { useEffect, useState } from "react";

const DEFAULT_TEXT =
  "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";

export default function AdminTickerPage() {
  const [tickerText, setTickerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTicker() {
      try {
        const response = await fetch("/api/ticker", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ticker load failed");
        }

        setTickerText(data.text || DEFAULT_TEXT);
      } catch {
        setMessage("Ticker load nahi hua. Page refresh karke dekhein.");
      } finally {
        setLoading(false);
      }
    }

    loadTicker();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tickerText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Save failed");
      }

      setTickerText(data.text);
      setMessage("Ticker successfully save ho gaya!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ticker save nahi hua."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">Manage Ticker</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <label
          htmlFor="tickerText"
          className="block font-medium"
        >
          Website Running Ticker Text
        </label>

        <textarea
          id="tickerText"
          value={tickerText}
          onChange={(e) => setTickerText(e.target.value)}
          placeholder="Enter ticker announcement..."
          rows={5}
          maxLength={2000}
          required
          disabled={loading || saving}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        />

        <p className="text-sm text-gray-500">
          {tickerText.length}/2000 characters
        </p>

        <button
          type="submit"
          disabled={loading || saving || !tickerText.trim()}
          className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Loading..."
            : saving
              ? "Saving..."
              : "Save Ticker"}
        </button>

        {message && (
          <p role="status" className="text-sm font-medium">
            {message}
          </p>
        )}
      </form>

      <div className="rounded-lg border p-4">
        <h2 className="mb-2 font-semibold">Preview</h2>
        <p className="break-words">{tickerText || DEFAULT_TEXT}</p>
      </div>
    </div>
  );
}
