// Month boundaries for the archive, anchored to Europe/Zurich. The offset is
// derived from the zone rather than hard-coded, so the March and October
// boundaries land where readers expect them to.

const TIME_ZONE = 'Europe/Zurich'

export const MIN_YEAR = 2018

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? ''
}

const offsetFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  timeZoneName: 'longOffset',
})

/** Zurich's UTC offset in minutes at a given instant (+60 in winter, +120 in summer). */
function offsetMinutesAt(date: Date): number {
  const name = offsetFormatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value

  // "GMT+01:00" / "GMT+2" / "GMT" — the exact spelling varies by runtime.
  const match = name?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!match) return 0

  const [, sign, hours, minutes] = match
  const total = Number(hours) * 60 + Number(minutes ?? 0)
  return sign === '-' ? -total : total
}

/**
 * The instant at which the given Zurich wall-clock time occurs.
 *
 * Two passes: guess with the offset at the UTC reading of the wall time, then
 * re-derive it at that guess. They only disagree within an hour of a DST
 * transition, where the second offset is the right one.
 */
function zurichWallTimeToInstant(
  year: number,
  month: number,
  day: number,
): Date {
  const asUtc = Date.UTC(year, month - 1, day)
  const guess = new Date(asUtc - offsetMinutesAt(new Date(asUtc)) * 60_000)
  return new Date(asUtc - offsetMinutesAt(guess) * 60_000)
}

export type DateRange = { from: string; until: string }

/** Half-open [from, until) covering one Zurich month. `month` is 1-indexed. */
export function zurichMonthRange(year: number, month: number): DateRange {
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1

  return {
    from: zurichWallTimeToInstant(year, month, 1).toISOString(),
    until: zurichWallTimeToInstant(nextYear, nextMonth, 1).toISOString(),
  }
}
