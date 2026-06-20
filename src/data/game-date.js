export const SEASONS = ['spring', 'summer', 'fall', 'winter'];
export const DAYS_PER_SEASON = 28;

/** Absolute day index within a year (0 = Spring 1) */
export function toAbsoluteDay(season, day) {
  const si = SEASONS.indexOf(season);
  if (si < 0 || day < 1 || day > DAYS_PER_SEASON) return null;
  return si * DAYS_PER_SEASON + (day - 1);
}

export function fromAbsoluteDay(abs) {
  const normalized = ((abs % 112) + 112) % 112;
  const si = Math.floor(normalized / DAYS_PER_SEASON);
  return { season: SEASONS[si], day: (normalized % DAYS_PER_SEASON) + 1 };
}

/** Days from `from` until `to` (can wrap year) */
export function daysUntil(fromSeason, fromDay, toSeason, toDay) {
  const a = toAbsoluteDay(fromSeason, fromDay);
  const b = toAbsoluteDay(toSeason, toDay);
  if (a == null || b == null) return null;
  let diff = b - a;
  if (diff < 0) diff += 112;
  return diff;
}

/** Stardew week key for gift reset (Sunday = start of week) */
export function getWeekKey(season, day) {
  const abs = toAbsoluteDay(season, day);
  if (abs == null) return null;
  const weekIndex = Math.floor(abs / 7);
  return `y${Math.floor(abs / 112)}-w${weekIndex}`;
}

/** Days until next Sunday (gift reset) */
export function daysUntilSunday(season, day) {
  const abs = toAbsoluteDay(season, day);
  if (abs == null) return null;
  const dayOfWeek = abs % 7;
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

export function formatGameDate(season, day, t) {
  return `${t(`season.${season}`)} ${day}`;
}
