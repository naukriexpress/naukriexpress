export default function HeroSearch() {
  return (
    <form method="get" action="/jobs" className="homepage-search-form mx-auto flex w-full items-center gap-2">
      <input
        type="text"
        name="q"
        placeholder="Search Jobs, Recruitment, Department or Qualification"
        aria-label="Search jobs"
        className="homepage-search-input min-w-0 w-full flex-1 rounded-lg border px-4 py-2.5 text-sm shadow-sm"
      />
      <button
        type="submit"
        className="homepage-search-submit shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
      >
        Search
      </button>
    </form>
  );
}
