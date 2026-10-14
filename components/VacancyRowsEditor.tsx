"use client";

import { useState } from "react";
import type { VacancyRow } from "@/lib/types";

type EditableVacancyRow = VacancyRow & {
  applyOnline?: string;
};

export default function VacancyRowsEditor({
  defaultRows,
}: {
  defaultRows?: VacancyRow[];
}) {
  const [rows, setRows] = useState<EditableVacancyRow[]>(
    defaultRows && defaultRows.length > 0
      ? defaultRows.map((row) => ({
          ...row,
          applyOnline:
            (row as EditableVacancyRow).applyOnline || "",
        }))
      : [{ post: "", category: "", count: 0, applyOnline: "" }]
  );

  const totalPositions = rows.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0),
    0
  );

  function updateRow(
    index: number,
    patch: Partial<EditableVacancyRow>
  ) {
    setRows((previous) =>
      previous.map((row, i) =>
        i === index ? { ...row, ...patch } : row
      )
    );
  }

  function addRow() {
    setRows((previous) => [
      ...previous,
      { post: "", category: "", count: 0, applyOnline: "" },
    ]);
  }

  function removeRow(index: number) {
    setRows((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  const inputClass =
    "w-full min-w-0 rounded-md border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-900">
        Post Details
      </label>

      <p className="mb-3 text-xs text-ink-700/70">
        Add each Trade, its total positions and its application link.
      </p>

      <div className="overflow-x-auto rounded-lg border border-ink-900/10">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-center">
                Serial number
              </th>
              <th className="border p-3 text-left">
                Job Title / Trade
              </th>
              <th className="border p-3 text-left">
                Total positions
              </th>
              <th className="border p-3 text-left">
                Apply Online Link
              </th>
              <th className="border p-3 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="border p-2 text-center font-semibold">
                  {new Intl.NumberFormat("hi-IN").format(
                    index + 1
                  )}
                </td>

                <td className="border p-2">
                  <input
                    type="text"
                    name="vacancy_post"
                    value={row.post}
                    onChange={(event) =>
                      updateRow(index, {
                        post: event.target.value,
                      })
                    }
                    placeholder="Apprentice (Electrician)"
                    className={inputClass}
                    required
                  />
                </td>

                <td className="border p-2">
                  <input
                    type="number"
                    name="vacancy_count"
                    min="0"
                    step="1"
                    value={row.count}
                    onChange={(event) =>
                      updateRow(index, {
                        count: Math.max(
                          0,
                          Math.floor(
                            Number(event.target.value) || 0
                          )
                        ),
                      })
                    }
                    className={inputClass}
                    required
                  />
                </td>

                <td className="border p-2">
                  <input
                    type="url"
                    name="vacancy_applyOnline"
                    value={row.applyOnline || ""}
                    onChange={(event) =>
                      updateRow(index, {
                        applyOnline: event.target.value,
                      })
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                </td>

                <td className="border p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>

                <input
                  type="hidden"
                  name="vacancy_category"
                  value={row.category || ""}
                />
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td colSpan={2} className="border p-3">
                Total Positions
              </td>
              <td className="border p-3 text-green-700">
                {new Intl.NumberFormat("hi-IN").format(
                  totalPositions
                )}
              </td>
              <td colSpan={2} className="border p-3">
                {rows.length} Trade(s)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          + Add Row
        </button>

        <div className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-bold text-green-800">
          Total Seats:{" "}
          {new Intl.NumberFormat("hi-IN").format(totalPositions)}
        </div>
      </div>
    </div>
  );
}
