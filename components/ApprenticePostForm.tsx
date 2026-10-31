"use client";

import { useState } from "react";
import { createJobAction } from "@/lib/actions";
import { JOB_LOCATION_OPTIONS } from "@/lib/locations";

type Trade = {
  id: number;
  title: string;
  qualification: string;
  positions: number;
  applyOnline: string;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none";

export default function ApprenticePostForm() {
  const [trades, setTrades] = useState<Trade[]>([
    { id: 1, title: "", qualification: "", positions: 0, applyOnline: "" },
  ]);

  const [nextId, setNextId] = useState(2);

  const totalPositions = trades.reduce(
    (sum, trade) => sum + Math.max(0, Number(trade.positions) || 0),
    0
  );

  function addRow() {
    setTrades((previous) => [
      ...previous,
      {
        id: nextId,
        title: "",
        qualification: "",
        positions: 0,
        applyOnline: "",
      },
    ]);
    setNextId((id) => id + 1);
  }

  function deleteRow(id: number) {
    setTrades((previous) => previous.filter((trade) => trade.id !== id));
  }

  function updateTrade(
    id: number,
    field: "title" | "qualification" | "positions" | "applyOnline",
    value: string
  ) {
    setTrades((previous) =>
      previous.map((trade) => {
        if (trade.id !== id) return trade;

        if (field === "positions") {
          return {
            ...trade,
            positions: Math.max(0, Math.floor(Number(value) || 0)),
          };
        }

        return { ...trade, [field]: value };
      })
    );
  }

  return (
    <form
      action={createJobAction}
      className="mx-auto max-w-5xl space-y-6 rounded-xl border bg-white p-5 md:p-7"
    >
      <h2 className="text-2xl font-bold text-gray-900">
        Add Apprentice Recruitment
      </h2>

      <p className="text-sm text-gray-600">
        Fill in the recruitment details. Total positions are calculated
        automatically from the trade rows.
      </p>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Basic Information</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Job Title *</span>
            <input
              name="title"
              required
              className={inputClass}
              placeholder="Apprentice Recruitment 2026"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">
              Organization Name *
            </span>
            <input
              name="organization"
              required
              className={inputClass}
              placeholder="Organization / Company name"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Department</span>
            <input
              name="department"
              className={inputClass}
              placeholder="Department name"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">
              Advertisement Number
            </span>
            <input
              name="advertisementNumber"
              className={inputClass}
              placeholder="Advertisement number"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Job Type</span>
            <select
              name="jobType"
              defaultValue="apprenticeship"
              className={inputClass}
            >
              <option value="apprenticeship">Apprenticeship</option>
              <option value="internship">Internship</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Total Positions</span>
            <input
              type="number"
              value={totalPositions}
              readOnly
              className={`${inputClass} bg-gray-100 font-bold`}
            />
            <input
              type="hidden"
              name="totalVacancies"
              value={totalPositions}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Trade / Post Details</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3">Sr. No.</th>
                <th className="border p-3 text-left">Trade Name *</th>
                <th className="border p-3 text-left">Required Qualification</th>
                <th className="border p-3 text-left">Positions *</th>
                <th className="border p-3 text-left">Apply Online Link</th>
                <th className="border p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade, index) => (
                <tr key={trade.id}>
                  <td className="border p-2 text-center">{index + 1}</td>

                  <td className="border p-2">
                    <input
                      name="vacancy_post"
                      required
                      value={trade.title}
                      onChange={(event) =>
                        updateTrade(trade.id, "title", event.target.value)
                      }
                      className={inputClass}
                      placeholder="Electrician / Wireman"
                    />
                    <input
                      type="hidden"
                      name="vacancy_category"
                      value=""
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      name="vacancy_qualification"
                      value={trade.qualification}
                      onChange={(event) =>
                        updateTrade(trade.id, "qualification", event.target.value)
                      }
                      className={inputClass}
                      placeholder="e.g. 10th Pass / ITI in Fitter"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      name="vacancy_count"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={trade.positions}
                      onChange={(event) =>
                        updateTrade(
                          trade.id,
                          "positions",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      name="vacancy_applyOnline"
                      type="url"
                      value={trade.applyOnline}
                      onChange={(event) =>
                        updateTrade(
                          trade.id,
                          "applyOnline",
                          event.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </td>

                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteRow(trade.id)}
                      disabled={trades.length === 1}
                      className="rounded bg-red-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="border p-3">
                  Total Positions
                </td>
                <td className="border p-3 text-green-700">
                  {totalPositions}
                </td>
                <td colSpan={2} className="border p-3">
                  {trades.length} Trade(s)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          + Add Trade
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Eligibility Details</h3>

        <div>
          <p className="mb-2 text-sm font-semibold">Educational Qualification</p>
          <div className="flex flex-wrap gap-4">
            {[
              ["10th", "10th Pass"],
              ["12th", "12th Pass"],
              ["iti", "ITI"],
              ["diploma", "Diploma"],
              ["graduate", "Graduate"],
              ["engineering", "Engineering"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="qualification" value={value} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Eligible Gender</p>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="gender" value="male" defaultChecked />
              Male
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="gender"
                value="female"
                defaultChecked
              />
              Female
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Minimum Age</span>
            <input
              name="minAge"
              type="number"
              min="0"
              className={inputClass}
              placeholder="18"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Maximum Age</span>
            <input
              name="maxAge"
              type="number"
              min="0"
              className={inputClass}
              placeholder="25"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Age Relaxation</span>
            <input
              name="ageRelaxation"
              className={inputClass}
              placeholder="As per official rules"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Location & Important Dates</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">State</span>
            <select name="state" defaultValue="Maharashtra" className={inputClass}>
              {JOB_LOCATION_OPTIONS.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">District</span>
            <input name="district" className={inputClass} placeholder="District" />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">
              Application Start Date
            </span>
            <input name="startDate" type="date" className={inputClass} />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Last Date *</span>
            <input name="lastDate" type="date" required className={inputClass} />
            <label className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
              <input type="checkbox" name="lastDateExtended" className="h-4 w-4" />
              Last Date Extended
            </label>
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Application Fee</span>
            <input
              name="applicationFee"
              className={inputClass}
              placeholder="Free / category-wise fee"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-semibold">Salary / Stipend</span>
            <input
              name="salary"
              className={inputClass}
              placeholder="Monthly stipend"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allIndia" />
          All India Recruitment
        </label>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Official Links</h3>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">
            Advertisement / Notification PDF URL
          </span>
          <input
            name="officialNotification"
            type="url"
            className={inputClass}
            placeholder="https://example.com/notification.pdf"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Official Website URL</span>
          <input
            name="officialWebsite"
            type="url"
            className={inputClass}
            placeholder="https://example.com"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">
            General Application URL (optional)
          </span>
          <input
            name="applyOnline"
            type="url"
            className={inputClass}
            placeholder="https://example.com/apply"
          />
        </label>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Additional Information</h3>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Eligibility Details</span>
          <textarea
            name="content_eligibility"
            rows={3}
            className={inputClass}
            placeholder="Eligibility conditions..."
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Selection Process</span>
          <textarea
            name="content_selectionProcess"
            rows={3}
            className={inputClass}
            placeholder="Selection process..."
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">How to Apply</span>
          <textarea
            name="content_howToApply"
            rows={3}
            className={inputClass}
            placeholder="Application steps..."
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">Publishing</h3>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" />
          Mark as Featured
        </label>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="publishMode"
              value="publish"
              defaultChecked
            />
            Publish Immediately
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="publishMode" value="draft" />
            Save as Draft
          </label>
        </div>
      </section>

      <button
        type="submit"
        className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 sm:w-auto"
      >
        Save & Publish Apprentice Recruitment
      </button>

      <p className="text-xs text-gray-500">
        Recruitment details are saved through the existing job database
        action. The notification field stores a PDF URL; it does not upload
        a file.
      </p>
    </form>
  );
}
