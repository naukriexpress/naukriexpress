export function hasPendingVacancyDetails({
  noticeDetailsPending,
  totalVacancies,
  vacancyBreakdownCounts,
}: {
  noticeDetailsPending?: boolean;
  totalVacancies: number;
  vacancyBreakdownCounts: number[];
}): boolean {
  const hasConfirmedBreakdown = vacancyBreakdownCounts.some((count) => count > 0);
  return Boolean(noticeDetailsPending) || (totalVacancies <= 0 && !hasConfirmedBreakdown);
}
