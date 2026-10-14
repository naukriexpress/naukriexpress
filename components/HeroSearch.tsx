export default function HeroSearch() {
  return (
    <form method="get" action="/jobs" className="mx-auto flex w-full items-center gap-2">
      <input
        type="text"
        name="q"
        placeholder="Search Jobs, Recruitment, Department or Qualification"
        aria-label="Search jobs"
        className="min-w-0 w-full flex-1 rounded-lg border border-ink-900/15 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-saffron-400"
      />
      <button
        type="submit"
        className="shrink-0 whitespace-nowrap rounded-lg bg-saffron-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600"
      >
        Search
      </button>
    </form>
  );
}
