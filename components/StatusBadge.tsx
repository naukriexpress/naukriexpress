import type { JobPosting } from "@/lib/types";
import { SSC_GD_NOTICE_PENDING_MARKER } from "@/lib/jobMarkers";

function computeBadge(
  job: Pick<JobPosting, "createdAt" | "dates" | "status" | "content">
) {
  if (job.content.importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER)) {
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

  if (daysToClose <= 3) return { label: "Last Date Soon", className: "bg-saffron-100 text-saffron-600" };
  if (daysSincePosted <= 5) return { label: "New", className: "bg-leaf-100 text-leaf-600" };
  return { label: "Open", className: "bg-brand-100 text-brand-700" };
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
