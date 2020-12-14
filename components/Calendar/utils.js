import { timeMonday, timeWeek, timeSunday, timeDay } from 'd3-time'
import { swissTime } from '../../lib/utils/format'

export const now = new Date()

export const urlDateFormat = '%Y-%m-%d'
export const datePickerFormat = '%d-%m-%y'
export const columnDateFormat = '%A, %d.%m'

export const getUrlDate = swissTime.format(urlDateFormat)
export const parseUrlDate = swissTime.parse(urlDateFormat)
export const reformatUrlDate = (urlDate, dateFormat) => {
  const date = parseUrlDate(urlDate)
  return swissTime.format(dateFormat)(date)
}
export const getUrlWeekStart = date => getUrlDate(timeMonday.floor(date))
export const getUrlWeekEnd = date => getUrlDate(timeMonday.ceil(date))
export const offsetUrlWeek = (urlDate, offset) => {
  const date = parseUrlDate(urlDate)
  const offsetDate = timeWeek.offset(date, offset)
  return getUrlDate(offsetDate)
}
export const isCurrentWeek = urlDate =>
  +timeMonday.floor(now) === +parseUrlDate(urlDate)
export const getDaysFromUrl = (urlDateFrom, urlDateUntil) =>
  timeDay
    .range(parseUrlDate(urlDateFrom), parseUrlDate(urlDateUntil))
    .map(getUrlDate)
