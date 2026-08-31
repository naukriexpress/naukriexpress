import Link from "next/link";
import { logoutAction } from "@/lib/actions";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/jobs", label: "Manage Jobs", icon: "🗂️" },
  { href: "/admin/jobs/new", label: "Add New Job", icon: "➕" },
  { href: "/admin/admit-card", label: "Manage Admit Card", icon: "📄" },
  { href: "/admin/ticker", label: "Manage Ticker", icon: "⚡" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper">
      <div className="container-page grid grid-cols-1 gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="rounded-xl2 border border-ink-900/10 bg-white p-4 shadow-card lg:sticky lg:top-24">
            <div className="mb-4 flex items-center gap-2 px-1">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 font-display text-sm font-bold text-white">
                NX
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">Admin Panel</p>
                <p className="text-[11px] text-ink-700/50">NaukriExpress</p>
              </div>
            </div>
            <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </nav>
            <form action={logoutAction} className="mt-3 border-t border-ink-900/10 pt-3">
              <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                🚪 Logout
              </button>
            </form>
            <Link href="/" className="mt-1 block px-3 py-2 text-xs text-ink-700/50 hover:text-brand-600">
              ← Back to website
            </Link>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}