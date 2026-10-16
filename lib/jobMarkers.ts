export const VACANCY_DETAILS_PENDING_MARKER = "[[VACANCY_DETAILS_PENDING]]";

// Kept for existing records that were originally created with this marker.
// Display copy and rendering behavior are intentionally recruitment-neutral.
export const SSC_GD_NOTICE_PENDING_MARKER = "[[SSC_GD_NOTICE_PENDING]]";

export function hasPendingVacancyDetails({
  importantInstructions,
  totalVacancies,
  vacancyBreakdownCounts,
}: {
  importantInstructions?: string;
  totalVacancies: number;
  vacancyBreakdownCounts: number[];
}): boolean {
  const hasPendingMarker =
    Boolean(importantInstructions?.includes(VACANCY_DETAILS_PENDING_MARKER)) ||
    Boolean(importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER));

  const hasConfirmedBreakdown = vacancyBreakdownCounts.some((count) => count > 0);
  return hasPendingMarker || (totalVacancies <= 0 && !hasConfirmedBreakdown);
}
