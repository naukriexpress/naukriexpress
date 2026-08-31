import type { Metadata } from "next";
import { loginAction } from "@/lib/actions";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const next = searchParams.next || "/admin/dashboard";

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-xl2 border border-ink-900/10 bg-white p-7 shadow-cardHover">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl2 bg-brand-700 font-display text-lg font-bold text-white">
            BGi
          </span>
          <h1 className="font-display text-xl font-bold text-ink-900">Admin Login</h1>
          <p className="mt-1 text-xs text-ink-700/60">Sign in to manage job postings</p>
        </div>

        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid username or password. Please try again.
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1.5" htmlFor="username">Username</label>
            <input id="username" name="username" type="text" required autoComplete="username"
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1.5" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            Sign In
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-ink-700/50">
          Demo credentials: <code className="font-mono">boss</code> / <code className="font-mono">welcome</code>
        </p>
      </div>
    </div>
  );
}
