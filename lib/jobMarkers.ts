export const VACANCY_DETAILS_PENDING_MARKER = "[[VACANCY_DETAILS_PENDING]]";

// Kept for existing records that were originally created with this marker.
// Display copy and rendering behavior are intentionally recruitment-neutral.
export const SSC_GD_NOTICE_PENDING_MARKER = "[[SSC_GD_NOTICE_PENDING]]";

export function hasPendingVacancyDetails({
  importantInstructions,
  totalVacancies,
  vacancyBreakdownLength,
}: {
  importantInstructions?: string;
  totalVacancies: number;
  vacancyBreakdownLength: number;
}): boolean {
  const hasPendingMarker =
    Boolean(importantInstructions?.includes(VACANCY_DETAILS_PENDING_MARKER)) ||
    Boolean(importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER));

  return hasPendingMarker || (totalVacancies <= 0 && vacancyBreakdownLength === 0);
}
