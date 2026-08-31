"use client";

import { useState, useEffect } from "react";

export default function AdminAdmitCardPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("adminAdmitCards") || "[]");
    setLinks(saved);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    const newLinks = [{ title, url }, ...links];
    setLinks(newLinks);
    localStorage.setItem("adminAdmitCards", JSON.stringify(newLinks));
    setTitle("");
    setUrl("");
  };

  const handleDelete = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    localStorage.setItem("adminAdmitCards", JSON.stringify(newLinks));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Admit Card Links</h1>
      
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admit Card Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bombay High Court Clerk Admit Card 2026"
            className="w-full p-2 border rounded-lg text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admit Card Link (URL)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/admit-card"
            className="w-full p-2 border rounded-lg text-gray-900"
            required
          />
        </div>
        <button type="submit" className="bg-saffron-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-saffron-700">
          Add Admit Card Link
        </button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Active Admit Cards</h3>
        {links.length === 0 ? (
          <p className="text-gray-500 text-sm">No admit cards added yet.</p>
        ) : (
          <div className="space-y-3">
            {links.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <a href={item.url} target="_blank" className="text-sm text-blue-600 underline truncate max-w-xs block">
                    {item.url}
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700 font-bold px-3 py-1 text-sm border border-red-200 rounded cursor-pointer"
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