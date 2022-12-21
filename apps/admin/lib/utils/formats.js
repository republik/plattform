import { formatLocale } from 'd3-format'
import { timeFormatLocale } from 'd3-time-format'

const thousandSeparator = '\u2019'
const chfNumbers = formatLocale({
  decimal: '.',
  thousands: thousandSeparator,
  grouping: [3],
  currency: ['CHF\u00a0', ''],
})
const chf4Format = chfNumbers.format('$.0f')
const chf5Format = chfNumbers.format('$,.0f')
const chf4FractionalFormat = chfNumbers.format('$.2f')
const chf5FractionalFormat = chfNumbers.format('$,.2f')
export const chfFormat = (value) => {
  const isFraction = value % 1 !== 0
  if (String(Math.round(value)).length > 4) {
    return isFraction ? chf5FractionalFormat(value) : chf5Format(value)
  }
  return isFraction ? chf4FractionalFormat(value) : chf4Format(value)
}

const countNumbers = formatLocale({
  decimal: ',',
  thousands: thousandSeparator,
  grouping: [3],
  currency: ['CHF\u00a0', ''],
})
const count4Format = countNumbers.format('.0f')
const count5Format = countNumbers.format(',.0f')
export const countFormat = (value) => {
  if (String(Math.round(value)).length > 4) {
    return count5Format(value)
  }
  return count4Format(value)
}

export const swissTime = timeFormatLocale({
  dateTime: '%A, der %e. %B %Y, %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ],
  shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  months: [
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
  ],
  shortMonths: [
    'Jan',
    'Feb',
    'Mrz',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ],
})

export const timeFormat = swissTime.format

const dateFormat = '%d.%m.%Y'
export const parseDate = swissTime.parse(dateFormat)
