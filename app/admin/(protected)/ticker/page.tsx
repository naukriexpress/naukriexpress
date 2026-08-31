"use client";

import { useState, useEffect } from "react";

export default function AdminTickerPage() {
  const [tickerText, setTickerText] = useState("");
  const [savedText, setSavedText] = useState("");

  useEffect(() => {
    const current = localStorage.getItem("siteTickerText") || "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";
    setTickerText(current);
    setSavedText(current);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("siteTickerText", tickerText);
    setSavedText(tickerText);
    alert("Ticker updated successfully!");
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
        <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 cursor-pointer">
          Update Running Line
        </button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg mb-2 text-gray-800">Current Live Preview:</h3>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-medium">
          {savedText}
        </div>
      </div>
    </div>
  );
}