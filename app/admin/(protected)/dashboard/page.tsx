import type { Metadata } from "next";
import Link from "next/link";
import { getStats } from "@/lib/db";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Published Jobs", value: stats.totalPublished, tone: "bg-brand-50 text-brand-700" },
    { label: "Active Jobs", value: stats.active, tone: "bg-leaf-50 text-leaf-600" },
    { label: "Expired Jobs", value: stats.expired, tone: "bg-ink-900/5 text-ink-700" },
    { label: "Draft / Scheduled", value: stats.draft, tone: "bg-saffron-50 text-saffron-600" },
    // Total Website Visitors ki value yahan fix ya modify kar sakte hain (jaise stats.totalVisitors ki jagah 0 ya koi aur value)
    { label: "Total Website Visitors", value: stats.totalVisitors.toLocaleString("en-IN"), tone: "bg-brand-50 text-brand-700" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-700/70 mt-1">Overview of your job portal</p>
        </div>
        <Link href="/admin/jobs/new" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + Add New Job
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 border border-ink-900/10 bg-white p-4 shadow-card">
            <p className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${c.tone}`}>{c.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink-900 mb-3">Most Viewed Jobs</h2>
          <div className="space-y-2">
            {stats.mostViewed.map((j) => (
              <Link key={j.id} href={`/admin/jobs/${j.id}/edit`} className="flex items-center justify-between rounded-lg border border-ink-900/10 px-3 py-2.5 text-sm hover:border-brand-400">
                <span className="truncate font-medium text-ink-900">{j.title}</span>
                <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{j.views} views</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink-900 mb-3">Jobs Ending Soon</h2>
          <div className="space-y-2">
            {stats.endingSoon.map((j) => (
              <Link key={j.id} href={`/admin/jobs/${j.id}/edit`} className="flex items-center justify-between rounded-lg border border-ink-900/10 px-3 py-2.5 text-sm hover:border-brand-400">
                <span className="truncate font-medium text-ink-900">{j.title}</span>
                <span className="shrink-0 rounded-md bg-saffron-50 px-2 py-0.5 text-xs font-semibold text-saffron-600">
                  {new Date(j.dates.lastDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}