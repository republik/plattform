import dayjs, { type Dayjs } from 'dayjs'
import locale_ch from 'dayjs/locale/de-ch'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.locale(locale_ch)
dayjs.tz.setDefault('Europe/Zurich')

/**
 * The configured dayjs (de-CH locale, utc/timezone/relativeTime plugins,
 * Europe/Zurich as default zone). Import it from here, not from 'dayjs', so
 * the setup above is always applied. Call `.tz()` for Zurich-local operations.
 */
export { dayjs }

type DateLike = string | number | Date | Dayjs

// "1. Januar 2026", with non-breaking spaces so the date never wraps
const DATE_FORMAT = 'D.\u00a0MMMM\u00a0YYYY'
const TIME_FORMAT = 'HH.mm'

const inZurich = (d: DateLike) => dayjs(d).tz()

/**
 * Get the formatted date in the correct time zone, e.g. `1. Januar 2026`
 * @param d string | number | Date
 * @returns string
 */
export const formatDate = (d: DateLike) => {
  return inZurich(d).format(DATE_FORMAT)
}

/**
 * Get the formatted time in the correct time zone, e.g. `13.45`
 * @param d string | number | Date
 * @returns string
 */
export const formatTime = (d: DateLike) => {
  return inZurich(d).format(TIME_FORMAT)
}

/**
 * Get the formatted date and time in the correct time zone, e.g. `1. Januar 2026, 13.45`
 * @param d string | number | Date
 * @returns string
 */
export const formatDateTime = (d: DateLike) => {
  return inZurich(d).format(`${DATE_FORMAT}, ${TIME_FORMAT}`)
}

/**
 * Get the formatted date in the correct time zone, including weekday and time,
 * e.g. `Donnerstag, 1. Januar 2026, 13.45`
 * @param d string | number | Date
 * @returns string
 */
export const formatDateTimeLong = (d: DateLike) => {
  return inZurich(d).format(`dddd, ${DATE_FORMAT}, ${TIME_FORMAT}`)
}

/**
 * Get the weekday in the correct time zone, e.g. `Donnerstag`
 * @param d string | number | Date
 * @returns string
 */
export const formatWeekday = (d: DateLike) => {
  return inZurich(d).format('dddd')
}

/**
 * Get a sortable day key in the correct time zone, e.g. `2026-01-01`.
 * For grouping and lookups, not for display.
 * @param d string | number | Date
 * @returns string
 */
export const formatDateKey = (d: DateLike) => {
  return inZurich(d).format('YYYY-MM-DD')
}

/**
 * Get a sortable month key in the correct time zone, e.g. `2026-01`.
 * For grouping and lookups, not for display.
 * @param d string | number | Date
 * @returns string
 */
export const formatMonthKey = (d: DateLike) => {
  return inZurich(d).format('YYYY-MM')
}

/**
 * Count the calendar days (midnights in Zurich) from `from` to `to`, e.g. from
 * today 23.00 to tomorrow 01.00 is 1 day. Negative when `to` is before `from`.
 * @param from string | number | Date
 * @param to string | number | Date
 * @returns number
 */
export const countDays = (from: DateLike, to: DateLike) => {
  return inZurich(to).startOf('day').diff(inZurich(from).startOf('day'), 'day')
}

/**
 * Count the full minute boundaries from `from` to `to`, e.g. from 13.45.50 to
 * 13.46.10 is 1 minute. Negative when `to` is before `from`.
 * @param from string | number | Date
 * @param to string | number | Date
 * @returns number
 */
export const countMinutes = (from: DateLike, to: DateLike) => {
  return dayjs(to)
    .startOf('minute')
    .diff(dayjs(from).startOf('minute'), 'minute')
}

/**
 * Get the formatted date range in the correct time zone, commonly used for events
 *
 * - When `end` is omitted, just `start` is formatted, e.g. `Montag, 1. Januar 2001, 13.13 Uhr`
 * - When `start` and `end` are on the same day: `Montag, 1. Januar 2001, 13.13–15.15 Uhr`
 * - When `start` and `end` are on different days, weekday and time are omitted: `1. Januar 2001–2. Februar 2002`
 * @param start string | number | Date
 * @param end string | number | Date
 * @returns string
 */
export const formatEventDateRange = (start: DateLike, end?: DateLike) => {
  if (!end) {
    return `${formatDateTimeLong(start)} Uhr`
  }

  if (inZurich(start).isSame(inZurich(end), 'day')) {
    return `${formatDateTimeLong(start)}–${formatTime(end)} Uhr`
  }

  // Assume that when days are different, we don't want to display time
  return `${formatDate(start)}–${formatDate(end)}`
}

/**
 * Check if the event with the provided start/end dates is still in the future (or ongoing)
 *
 * @param start string | number | Date
 * @param end string | number | Date
 * @returns boolean
 */
export const isFutureEvent = (start: DateLike, end?: DateLike) => {
  const now = dayjs()
  return end ? now.isBefore(end) : now.isBefore(start)
}

export const formatTimeAgo = (date: DateLike) => {
  return dayjs(date).fromNow()
}
