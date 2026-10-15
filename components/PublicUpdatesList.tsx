import { getPool } from "@/lib/pgClient";

type UpdateItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  publish_date: string | null;
  amount: string | null;
  eligibility: string | null;
  last_date: string | null;
  item_url: string | null;
  objection_url: string | null;
  apply_url: string | null;
};

export default async function PublicUpdatesList({
  category,
}: {
  category: "results" | "answer-key" | "syllabus" | "scholarship";
}) {
  let items: UpdateItem[] = [];

  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, title, organization, description, publish_date,
              amount, eligibility, last_date, item_url, objection_url, apply_url
       FROM site_updates
       WHERE category = $1
       ORDER BY created_at DESC`,
      [category]
    );
    items = result.rows as UpdateItem[];
  } catch (error) {
    console.error("Public updates page load error:", error);
    return (
      <p role="alert" className="mt-8 rounded-xl border bg-white p-5 text-sm text-red-600">
        Updates are temporarily unavailable. Please check back later.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-xl border bg-white p-5 text-sm text-gray-600">
        Abhi koi update publish nahi kiya gaya hai. Kripya baad mein check karein.
      </p>
    );
  }

  if (category === "scholarship") {
    return (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const initials = (item.organization || item.title)
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0] || "")
            .join("")
            .toUpperCase();

          return (
            <article
              key={item.id}
              className="group flex min-w-0 flex-col rounded-xl2 border border-ink-900/10 bg-white p-4 shadow-card transition-shadow hover:shadow-cardHover sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-50 font-display text-sm font-bold text-brand-700">
                  {initials || "🎓"}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 break-words font-display text-base font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
                    {item.title}
                  </h2>
                  {item.organization && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-ink-700">
                      {item.organization}
                    </p>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="mt-4 line-clamp-3 break-words text-sm leading-relaxed text-ink-800">
                  {item.description}
                </p>
              )}

              <dl className="mt-4 grid flex-1 grid-cols-1 gap-3 border-t border-ink-900/10 pt-4 text-sm">
                {item.amount && (
                  <div className="scholarship-benefit-box rounded-lg p-3">
                    <dt className="scholarship-benefit-label text-xs font-medium">
                      Scholarship Amount / Benefits
                    </dt>
                    <dd className="scholarship-benefit-value mt-1 break-words font-semibold">
                      {item.amount}
                    </dd>
                  </div>
                )}
                {item.eligibility && (
                  <div>
                    <dt className="text-xs text-ink-700/60">Eligibility</dt>
                    <dd className="mt-1 line-clamp-3 whitespace-pre-wrap break-words font-medium text-ink-900">
                      {item.eligibility}
                    </dd>
                  </div>
                )}
                {item.last_date && (
                  <div>
                    <dt className="text-xs text-ink-700/60">Last Date</dt>
                    <dd className="mt-1 font-semibold text-saffron-600">
                      {String(item.last_date).slice(0, 10)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-900/10 pt-4">
                {item.item_url && (
                  <a
                    href={item.item_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-brand-600 px-3 py-2.5 text-center text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    Official Notification
                  </a>
                )}
                {item.apply_url && (
                  <a
                    href={item.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-green-700 px-3 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-green-800"
                  >
                    Apply Online
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-sm"
        >
          <h2 className="break-words text-lg font-bold text-ink-900">
            {item.title}
          </h2>

          {item.organization && (
            <p className="mt-1 text-sm text-ink-700/70">
              {item.organization}
            </p>
          )}

          {item.description && (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-ink-800">
              {item.description}
            </p>
          )}

          {item.amount && (
            <p className="mt-2 text-sm">
              <strong>Scholarship Amount:</strong> {item.amount}
            </p>
          )}

          {item.eligibility && (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">
              <strong>Eligibility:</strong> {item.eligibility}
            </p>
          )}

          {item.publish_date && (
            <p className="mt-2 text-xs text-ink-700/70">
              Date: {String(item.publish_date).slice(0, 10)}
            </p>
          )}

          {item.last_date && (
            <p className="mt-2 text-sm font-medium text-red-700">
              Last Date: {String(item.last_date).slice(0, 10)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {item.item_url && (
              <a
                href={item.item_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                {category === "syllabus"
                  ? "View Syllabus / PDF"
                  : category === "answer-key"
                    ? "View Answer Key"
                    : "Check Result"}
              </a>
            )}

            {item.objection_url && (
              <a
                href={item.objection_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-ink-900/20 px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-gray-50"
              >
                Submit Objection
              </a>
            )}

            {item.apply_url && (
              <a
                href={item.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Apply Online
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
