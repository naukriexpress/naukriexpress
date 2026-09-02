"use client";

import { useState, useEffect } from "react";

interface ResultItem {
  id: string;
  title: string;
  shortDescription?: string;
  category?: string;
  resultDate?: string;
  officialLink: string;
  status: "published" | "draft";
}

const emptyForm = {
  title: "",
  shortDescription: "",
  category: "",
  resultDate: "",
  officialLink: "",
  status: "published" as "published" | "draft",
};

export default function AdminResultsPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results");
      if (res.ok) {
        const json = await res.json();
        setResults(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch results", err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.officialLink) return;
    setLoading(true);

    try {
      const url = editingId ? `/api/results?id=${editingId}` : "/api/results";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(editingId ? "Result Updated Successfully" : "Result Added Successfully");
        resetForm();
        fetchResults();
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Failed to save result");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving result");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ResultItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      shortDescription: item.shortDescription || "",
      category: item.category || "",
      resultDate: item.resultDate || "",
      officialLink: item.officialLink,
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTogglePublish = async (item: ResultItem) => {
    try {
      const res = await fetch(`/api/results?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: item.status === "published" ? "draft" : "published" }),
      });
      if (res.ok) fetchResults();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchResults();
      else alert("Failed to delete");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Results</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border mb-6 space-y-4">
        {editingId && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            Editing existing result
            <button type="button" onClick={resetForm} className="font-semibold underline">
              Cancel
            </button>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Result Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Maharashtra Police Constable Final Result 2026"
            className="w-full p-2 border rounded-lg text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            rows={2}
            placeholder="Brief note about this result..."
            className="w-full p-2 border rounded-lg text-gray-900"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Police, Banking, Railway"
              className="w-full p-2 border rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Result Date</label>
            <input
              type="date"
              value={form.resultDate}
              onChange={(e) => setForm({ ...form, resultDate: e.target.value })}
              className="w-full p-2 border rounded-lg text-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Official Result Link</label>
          <input
            type="url"
            value={form.officialLink}
            onChange={(e) => setForm({ ...form, officialLink: e.target.value })}
            placeholder="https://example.com/result"
            className="w-full p-2 border rounded-lg text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "published" | "draft" })}
            className="w-full p-2 border rounded-lg text-gray-900"
          >
            <option value="published">Published</option>
            <option value="draft">Draft (hidden from public site)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Saving..." : editingId ? "Save Changes" : "Add Result"}
        </button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg mb-4 text-gray-800">All Results (Database Live)</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 text-sm">No results added yet.</p>
        ) : (
          <div className="space-y-3">
            {results.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.category || "—"} · {item.status === "published" ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="text-xs font-semibold px-3 py-1 border rounded cursor-pointer border-amber-300 text-amber-700 bg-white hover:bg-amber-50"
                  >
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-xs font-semibold px-3 py-1 border rounded cursor-pointer border-brand-300 text-brand-700 bg-white hover:bg-brand-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs font-semibold px-3 py-1 border rounded cursor-pointer border-red-200 text-red-600 bg-white hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
