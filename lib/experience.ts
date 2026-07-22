export function formatExperiencePeriod(startDate: Date | string, endDate: Date | string | null) {
  const formatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
  const start = formatter.format(new Date(startDate));
  const end = endDate ? formatter.format(new Date(endDate)) : "Present";
  return `${start} — ${end}`;
}
