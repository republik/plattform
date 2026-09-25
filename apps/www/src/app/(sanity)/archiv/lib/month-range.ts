// Month boundaries are anchored to Europe/Zurich, with the offset derived from
// the zone so the DST months start where readers expect them to.

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
  return MONTH_NAMES[month - 1]
}

const yearMonthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
})

/** The current year and month in Zurich, so server and client agree. */
export function currentZurichMonth(): { year: number; month: number } {
  const parts = yearMonthFormatter.formatToParts(new Date())
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value)
  return { year: get('year'), month: get('month') }
}

/** Null unless the params name a month between January 2018 and now. */
export function parseArchiveParams(params: {
  year?: string | string[]
  month?: string | string[]
}): { year: number; month: number } | null {
  const year = Number(params.year)
  const month = Number(params.month)
  const now = currentZurichMonth()

  if (!Number.isInteger(year) || !Number.isInteger(month)) return null
  if (year < MIN_YEAR || year > now.year) return null
  if (month < 1 || month > (year === now.year ? now.month : 12)) return null

  return { year, month }
}

/**
 * The current or previous month. Their teasers still change, while older
 * months only do when an editor goes back to one.
 */
export function isRecentMonth(year: number, month: number): boolean {
  const now = currentZurichMonth()
  const monthsAgo = (now.year - year) * 12 + (now.month - month)
  return monthsAgo <= 1
}

const offsetFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  timeZoneName: 'longOffset',
})

/** Zurich's UTC offset in minutes at a given instant. */
function offsetMinutesAt(date: Date): number {
  const name = offsetFormatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value

  // "GMT+01:00" / "GMT+2" / "GMT", depending on the runtime.
  const match = name?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!match) return 0

  const [, sign, hours, minutes] = match
  const total = Number(hours) * 60 + Number(minutes ?? 0)
  return sign === '-' ? -total : total
}

/**
 * Midnight at the start of a Zurich day. The second pass corrects the offset
 * guess, which is only off within an hour of a DST transition.
 */
function zurichMidnight(year: number, month: number, day: number): Date {
  const asUtc = Date.UTC(year, month - 1, day)
  const guess = new Date(asUtc - offsetMinutesAt(new Date(asUtc)) * 60_000)
  return new Date(asUtc - offsetMinutesAt(guess) * 60_000)
}

/** Half-open [from, until) covering one Zurich month. `month` is 1-indexed. */
export function zurichMonthRange(
  year: number,
  month: number,
): { from: string; until: string } {
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1

  return {
    from: zurichMidnight(year, month, 1).toISOString(),
    until: zurichMidnight(nextYear, nextMonth, 1).toISOString(),
  }
}
