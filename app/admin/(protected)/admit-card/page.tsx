"use client";

import { useState, useEffect } from "react";

interface AdmitCardItem {
  id: string;
  title: string;
  organization: string;
  admitCardDate?: string;
  examDate?: string;
  downloadUrl: string;
  status: "published" | "draft";
}

const emptyForm = {
  title: "",
  organization: "",
  admitCardDate: "",
  examDate: "",
  downloadUrl: "",
  status: "published" as "published" | "draft",
};

export default function AdminAdmitCardPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [links, setLinks] = useState<AdmitCardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmitCards = async () => {
    try {
      const res = await fetch("/api/admit-cards");
      if (res.ok) {
        const json = await res.json();
        setLinks(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch admit cards", err);
    }
  };

  useEffect(() => {
    fetchAdmitCards();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.downloadUrl) return;
    setLoading(true);

    try {
      const url = editingId ? `/api/admit-cards?id=${editingId}` : "/api/admit-cards";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organization: form.organization || "General" }),
      });

      if (res.ok) {
        alert(editingId ? "Admit Card Updated Successfully" : "Admit Card Added Successfully");
        resetForm();
        fetchAdmitCards();
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Failed to save admit card");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving admit card");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: AdmitCardItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      organization: item.organization,
      admitCardDate: item.admitCardDate || "",
      examDate: item.examDate || "",
      downloadUrl: item.downloadUrl,
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTogglePublish = async (item: AdmitCardItem) => {
    try {
      const res = await fetch(`/api/admit-cards?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: item.status === "published" ? "draft" : "published" }),
      });
      if (res.ok) fetchAdmitCards();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`/api/admit-cards?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchAdmitCards();
      else alert("Failed to delete");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Admit Card Links</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border mb-6 space-y-4">
        {editingId && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            Editing existing admit card
            <button type="button" onClick={resetForm} className="font-semibold underline">
              Cancel
            </button>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admit Card Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Bombay High Court Clerk Admit Card 2026"
            className="w-full p-2 border rounded-lg text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Department</label>
          <input
            type="text"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            placeholder="e.g. Bombay High Court"
            className="w-full p-2 border rounded-lg text-gray-900"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admit Card Date</label>
            <input
              type="date"
              value={form.admitCardDate}
              onChange={(e) => setForm({ ...form, admitCardDate: e.target.value })}
              className="w-full p-2 border rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full p-2 border rounded-lg text-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admit Card Link (URL)</label>
          <input
            type="url"
            value={form.downloadUrl}
            onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
            placeholder="https://example.com/admit-card"
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
          className="bg-saffron-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-saffron-700 disabled:opacity-50"
        >
          {loading ? "Saving to Database..." : editingId ? "Save Changes" : "Add Admit Card Link"}
        </button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg mb-4 text-gray-800">All Admit Cards (Database Live)</h3>
        {links.length === 0 ? (
          <p className="text-gray-500 text-sm">No admit cards added yet.</p>
        ) : (
          <div className="space-y-3">
            {links.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.organization} · {item.status === "published" ? "Published" : "Draft"}
                  </p>
                  <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline truncate max-w-xs block">
                    {item.downloadUrl}
                  </a>
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
