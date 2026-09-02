"use client";

import { useState, useEffect } from "react";

export default function AdminTickerPage() {
  const [tickerText, setTickerText] = useState("");
  const [tickerLink, setTickerLink] = useState("");
  const [tickers, setTickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickers = async () => {
    try {
      const res = await fetch("/api/tickers");
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        setTickers(list);
        if (list.length > 0) {
          setTickerText(list[0].text || "");
          setTickerLink(list[0].link || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickers", err);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerText) return;
    setLoading(true);

    try {
      // Send data to PostgreSQL database via API
      const res = await fetch("/api/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: tickerText,
          link: tickerLink || null,
          active: true,
        }),
      });

      if (res.ok) {
        alert("Ticker updated successfully in Database!");
        fetchTickers();
      } else {
        alert("Failed to update ticker");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving ticker");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticker?")) return;
    try {
      const res = await fetch(`/api/tickers?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTickers();
      } else {
        alert("Failed to delete ticker");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Running Ticker Line</h1>
      
      <form onSubmit={handleSave} className="bg-white p-4 rounded-xl shadow-sm border mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ticker / Running Text Update</label>
          <textarea
            value={tickerText}
            onChange={(e) => setTickerText(e.target.value)}
            rows={3}
            placeholder="Enter latest update text here..."
            className="w-full p-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
          <input
            type="url"
            value={tickerLink}
            onChange={(e) => setTickerLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Saving to Database..." : "Update Running Line"}
        </button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg mb-2 text-gray-800">Database Live Tickers:</h3>
        {tickers.length === 0 ? (
          <p className="text-gray-500 text-sm">No active tickers found.</p>
        ) : (
          <div className="space-y-3">
            {tickers.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p className="text-amber-900 font-medium">{item.text}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" className="text-sm text-blue-600 underline truncate max-w-xs block">
                      {item.link}
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700 font-bold px-3 py-1 text-sm border border-red-200 bg-white rounded cursor-pointer"
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