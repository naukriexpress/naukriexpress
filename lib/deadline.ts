/** Date helpers use India time because recruitment deadlines are published in IST. */
export function getIndiaTodayDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Returns whole calendar days remaining, or null for an invalid date. */
export function getDaysUntilDate(dateValue: string | undefined, today = getIndiaTodayDate()): number | null {
  if (!dateValue) return null;

  const date = dateValue.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const targetTime = Date.parse(`${date}T00:00:00.000Z`);
  const todayTime = Date.parse(`${today}T00:00:00.000Z`);
  if (!Number.isFinite(targetTime) || !Number.isFinite(todayTime)) return null;

  return Math.round((targetTime - todayTime) / 86_400_000);
}
