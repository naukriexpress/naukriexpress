"use client";

import { useState } from "react";
import type { VacancyRow } from "@/lib/types";

export default function VacancyRowsEditor({ defaultRows }: { defaultRows?: VacancyRow[] }) {
  const [rows, setRows] = useState<VacancyRow[]>(
    defaultRows && defaultRows.length > 0 ? defaultRows : [{ post: "", category: "", count: 0 }]
  );

  function updateRow(i: number, patch: Partial<VacancyRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { post: "", category: "", count: 0 }]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        Post-wise &amp; Category-wise Vacancy Breakdown
      </label>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-ink-900/10 p-2.5 sm:grid-cols-[1fr_1.4fr_100px_auto]">
            <input
              type="text"
              placeholder="Post name (e.g. Constable)"
              value={row.post}
              onChange={(e) => updateRow(i, { post: e.target.value })}
              name="vacancy_post"
              className="rounded-md border border-ink-900/15 px-2.5 py-2 text-sm focus:border-brand-500"
            />
            <input
              type="text"
              placeholder="Category breakup (e.g. Open: 40, OBC: 20, SC: 12)"
              value={row.category}
              onChange={(e) => updateRow(i, { category: e.target.value })}
              name="vacancy_category"
              className="rounded-md border border-ink-900/15 px-2.5 py-2 text-sm focus:border-brand-500"
            />
            <input
              type="number"
              placeholder="Count"
              value={row.count || ""}
              onChange={(e) => updateRow(i, { count: Number(e.target.value) })}
              name="vacancy_count"
              className="rounded-md border border-ink-900/15 px-2.5 py-2 text-sm focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="rounded-md border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
      >
        + Add Post
      </button>
    </div>
  );
}
