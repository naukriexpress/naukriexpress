export default function JobDetailsLoading() {
  return (
    <main className="container-page job-details-skeleton py-6 sm:py-8" aria-label="Loading job details" aria-busy="true">
      <div className="mb-4 h-4 w-44 animate-pulse rounded bg-slate-200" />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="animate-pulse rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50/70 p-4 sm:p-5">
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-24 rounded bg-sky-100" />
            <div className="h-5 w-24 rounded bg-slate-100" />
          </div>
          <div className="h-6 w-11/12 rounded bg-slate-200 sm:h-8" />
          <div className="mt-2 h-6 w-3/4 rounded bg-slate-200 sm:h-8" />
          <div className="mt-4 h-4 w-2/5 rounded bg-sky-100" />
          <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="h-3 w-2/3 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-4/5 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 w-16 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-4/5 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
