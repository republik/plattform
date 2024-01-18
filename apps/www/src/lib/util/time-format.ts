import dayjs from 'dayjs'
import locale_ch from 'dayjs/locale/de-ch'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale(locale_ch)
dayjs.tz.setDefault('Europe/Berlin')

type DateLike = string | number | Date

/**
 * Get the formatted date in the correct time zone, including weekday and time
 * @param d string | number | Date
 * @returns string
 */
export const formatDateTimeLong = (d: DateLike) => {
  return dayjs(d).tz().format('dddd, DD.MM.YYYY, HH.mm')
}

/**
 * Get the formatted date in the correct time zone
 * @param d string | number | Date
 * @returns string
 */
export const formatDate = (d: DateLike) => {
  return dayjs(d).tz().format('DD.MM.YYYY')
}

/**
 * Get the formatted short date in the correct time zone
 * @param d string | number | Date
 * @returns string
 */
export const formatDateShort = (d: DateLike) => {
  return dayjs(d).tz().format('DD.MM.YY')
}

/**
 * Get the formatted time in the correct time zone
 * @param d string | number | Date
 * @returns string
 */
export const formatTime = (d: DateLike) => {
  return dayjs(d).tz().format('HH.mm')
}

/**
 * Get the formatted date range in the correct time zone, commonly used for events
 *
 * - When `end` is omitted, just `start` is formatted, e.g. `Montag, 01.01.2001, 13.13`
 * - When `start` and `end` are on the same day: `Montag, 01.01.2001, 13.13–15.15`
 * - When `start` and `end` are on different days, weekday and time are omitted: `01.01.2001–02.02.2002`
 * @param start string | number | Date
 * @param end string | number | Date
 * @returns string
 */
export const formatEventDateRange = (start: DateLike, end?: DateLike) => {
  if (!end) {
    return `${formatDateTimeLong(start)} Uhr`
  }

  if (dayjs(start).isSame(end, 'day')) {
    return `${formatDateTimeLong(start)}–${formatTime(end)} Uhr`
  }

  // Assume that when days are different, we don't want to display time
  return `${formatDate(start)}–${formatDate(end)}`
}

export const isFutureEvent = (start: DateLike, end?: DateLike) => {
  const now = dayjs()
  return now.isBefore(start) || now.isBefore(end)
}
