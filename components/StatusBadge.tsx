import type { JobPosting } from "@/lib/types";

function computeBadge(
  job: Pick<JobPosting, "createdAt" | "dates" | "status" | "noticeDetailsPending">
) {
  if (job.noticeDetailsPending) {
    return { label: "Notice Awaited", className: "notice-awaited-badge" };
  }

  if (job.status === "expired") {
    return { label: "Expired", className: "bg-ink-900/10 text-ink-700" };
  }

  const now = new Date();
  const created = new Date(job.createdAt);
  const daysSincePosted = (now.getTime() - created.getTime()) / 86400000;

  const lastDate = new Date(job.dates.lastDate);
  const daysToClose = (lastDate.getTime() - now.getTime()) / 86400000;

  if (daysToClose <= 3) return { label: "Last Date Soon", className: "last-date-soon-badge" };
  if (daysSincePosted <= 5) return { label: "New", className: "new-status-badge" };
  return { label: "Open", className: "open-status-badge" };
}

export default function StatusBadge({
  job,
}: {
  job: Pick<JobPosting, "createdAt" | "dates" | "status" | "content">;
}) {
  const badge = computeBadge(job);
  return (
    <span className={`chip ${badge.className} border-transparent py-1 px-2.5 text-xs font-semibold`}>
      {badge.label}
    </span>
  );
}
