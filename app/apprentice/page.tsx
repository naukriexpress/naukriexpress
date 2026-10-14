import Link from "next/link";
import { queryJobs } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ApprenticePage() {
  const { results: jobs } = await queryJobs({
    jobType: ["apprenticeship"],
    sort: "latest",
    pageSize: 100,
  });

  const rows = jobs.flatMap((job) => {
    const trades =
      job.vacancyBreakdown && job.vacancyBreakdown.length > 0
        ? job.vacancyBreakdown
        : [
            {
              post: job.title,
              category: "",
              count: job.totalVacancies,
              applyOnline: job.links.applyOnline || "",
            },
          ];

    return trades.map((trade, index) => ({
      key: `${job.id}-${index}`,
      job,
      trade,
      applyLink: trade.applyOnline || job.links.applyOnline || "",
    }));
  });

  const totalPositions = rows.reduce(
    (total, row) => total + (Number(row.trade.count) || 0),
    0
  );

  return (
    <main className="container-page py-8">
      <h1 className="mb-2 text-3xl font-bold text-ink-900">
        Apprentice Recruitment
      </h1>

      <p className="mb-6 text-gray-600">
        Latest apprentice vacancies, trade-wise positions and application links.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl2 border border-ink-900/10 bg-white p-6 text-ink-700">
          <h2 className="text-lg font-semibold text-ink-900">
            No Apprentice Recruitment Available
          </h2>
          <p className="mt-2 text-sm">
            New apprentice recruitment updates will appear here after they are
            published from the Admin Panel.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3">Serial No.</th>
                  <th className="border p-3">Recruitment / Trade</th>
                  <th className="border p-3">Positions</th>
                  <th className="border p-3">Apply Online</th>
                  <th className="border p-3">Details</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(({ key, job, trade, applyLink }, index) => (
                  <tr key={key}>
                    <td className="border p-3">{index + 1}</td>
                    <td className="border p-3">
                      <div className="font-semibold text-ink-900">
                        {trade.post}
                      </div>
                      <div className="mt-1 text-xs text-ink-700/70">
                        {job.organization}
                      </div>
                    </td>
                    <td className="border p-3">
                      {Number(trade.count || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="border p-3">
                      {applyLink ? (
                        <a
                          href={applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block whitespace-nowrap rounded-lg bg-green-600 px-3 py-2 font-semibold text-white hover:bg-green-700"
                        >
                          Apply Online
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Link not added
                        </span>
                      )}
                    </td>
                    <td className="border p-3">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-block whitespace-nowrap rounded-lg border border-brand-600 px-3 py-2 font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={2} className="border p-3">
                    Total Positions
                  </td>
                  <td className="border p-3">
                    {totalPositions.toLocaleString("en-IN")}
                  </td>
                  <td colSpan={2} className="border p-3">
                    {jobs.length} recruitment(s)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
