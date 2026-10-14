import Link from "next/link";

export default function ApprenticePage() {
  return (
    <main className="container-page py-8">
      <h1 className="mb-2 text-3xl font-bold text-ink-900">
        Apprentice Recruitment 2026
      </h1>

      <p className="mb-6 text-gray-600">
        Latest Apprentice vacancies, eligibility, total posts and
        application links.
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Serial number</th>
              <th className="border p-3">Job Title / Trade</th>
              <th className="border p-3">Total positions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border p-3">१</td>
              <td className="border p-3">
                Apprentice (Electrician)
              </td>
              <td className="border p-3">४०</td>
            </tr>

            <tr>
              <td className="border p-3">२</td>
              <td className="border p-3">
                Apprentice (Wireman)
              </td>
              <td className="border p-3">१२</td>
            </tr>
          </tbody>

          <tfoot className="bg-gray-50 font-bold">
            <tr>
              <td colSpan={2} className="border p-3">
                Total Positions
              </td>
              <td className="border p-3">५२</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6">
        <Link
          href="/jobs"
          className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          View All Jobs
        </Link>
      </div>
    </main>
  );
}
