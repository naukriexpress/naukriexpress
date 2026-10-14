"use client";

import { useState } from "react";

type Trade = {
  id: string;
  title: string;
  positions: number;
};

export default function ApprenticePostForm() {
  const [jobTitle, setJobTitle] = useState("");
  const [trades, setTrades] = useState<Trade[]>([
    { id: crypto.randomUUID(), title: "Apprentice (Electrician)", positions: 40 },
    { id: crypto.randomUUID(), title: "Apprentice (Wireman)", positions: 12 },
  ]);

  // Automatic total calculation
  const totalPositions = trades.reduce(
    (sum, trade) => sum + (Number(trade.positions) || 0),
    0
  );

  // Add new row
  function addRow() {
    setTrades((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        positions: 0,
      },
    ]);
  }

  // Delete row
  function deleteRow(id: string) {
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
  }

  // Update a row
  function updateTrade(
    id: string,
    field: "title" | "positions",
    value: string
  ) {
    setTrades((prev) =>
      prev.map((trade) =>
        trade.id === id
          ? {
              ...trade,
              [field]:
                field === "positions"
                  ? Math.max(0, Math.floor(Number(value) || 0))
                  : value,
            }
          : trade
      )
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 rounded-xl border bg-white p-5">
      <h2 className="text-2xl font-bold">
        Add Apprentice Recruitment
      </h2>

      <label className="block space-y-2">
        <span className="font-semibold">Job Title</span>
        <input
          className="w-full rounded border p-3"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Apprentice Recruitment 2026"
        />
      </label>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Post Details</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3">Serial number</th>
                <th className="border p-3">Job Title / Trade</th>
                <th className="border p-3">Total positions</th>
                <th className="border p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade, index) => (
                <tr key={trade.id}>
                  <td className="border p-2 text-center">
                    {new Intl.NumberFormat("hi-IN").format(index + 1)}
                  </td>

                  <td className="border p-2">
                    <input
                      className="w-full rounded border p-2"
                      value={trade.title}
                      onChange={(e) =>
                        updateTrade(trade.id, "title", e.target.value)
                      }
                      placeholder="Apprentice (Electrician)"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="w-full rounded border p-2"
                      value={trade.positions}
                      onChange={(e) =>
                        updateTrade(
                          trade.id,
                          "positions",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteRow(trade.id)}
                      className="rounded bg-red-600 px-3 py-2 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border p-3">
                  Total positions
                </td>
                <td className="border p-3 text-center text-green-700">
                  {new Intl.NumberFormat("hi-IN").format(totalPositions)}
                </td>
                <td className="border p-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 rounded bg-blue-600 px-4 py-3 font-semibold text-white"
        >
          + Add Row
        </button>
      </div>

      <div className="rounded bg-gray-50 p-3">
        <strong>Total Seats: </strong>
        {new Intl.NumberFormat("hi-IN").format(totalPositions)}
      </div>

      <p className="text-sm text-gray-500">
        फिलहाल यह form data को केवल React state में रखता है।
        Supabase में save करने के लिए database integration जोड़ना होगा।
      </p>
    </div>
  );
}
