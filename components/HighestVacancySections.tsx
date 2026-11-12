import { getHomepageJobSummaries } from "@/lib/db";
import type { HomepageJobSummary } from "@/lib/types";
import HighestVacancyJobs from "./HighestVacancyJobs";
import HighestVacancyApprentice from "./HighestVacancyApprentice";
import HomepageQuickUpdates from "./HomepageQuickUpdates";

export default async function HighestVacancySections() {
  let jobs: HomepageJobSummary[] = [];
  let loadFailed = false;

  try {
    // Send only the fields needed by the two homepage highlights. The cached
    // server query avoids downloading every full job and vacancy row in the browser.
    jobs = await getHomepageJobSummaries();
  } catch (error) {
    loadFailed = true;
    console.error("Homepage vacancy highlights could not be loaded:", error);
  }

  return (
    <div className="container-page mt-6 sm:mt-8">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="min-w-0 space-y-4">
          <HighestVacancyJobs jobs={jobs} loadFailed={loadFailed} />
          <HighestVacancyApprentice jobs={jobs} loadFailed={loadFailed} />
        </div>
        <HomepageQuickUpdates />
      </div>
    </div>
  );
}
