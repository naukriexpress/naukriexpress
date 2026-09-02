export default function HeroSearch() {
  return (
    <form method="get" action="/jobs" className="mx-auto flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
      <input
        type="text"
        name="q"
        placeholder="Search Jobs, Recruitment, Department or Qualification"
        className="w-full flex-1 rounded-xl border-0 bg-white px-5 py-4 text-sm text-ink-900 shadow-lg focus:ring-2 focus:ring-saffron-400"
      />
      <button
        type="submit"
        className="rounded-xl bg-saffron-500 px-6 py-4 text-sm font-semibold text-white shadow-lg hover:bg-saffron-600 transition-colors"
      >
        Search Jobs
      </button>
    </form>
  );
}
