const { formatLocale } = require('d3-format')
const { timeFormatLocale } = require('d3-time-format')
const timeahead = require('./timeahead')

const swissTime = timeFormatLocale({
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

const timeFormat = swissTime.format
const timeParse = swissTime.parse
const utcTimeFormat = swissTime.utcFormat
const utcTimeParse = swissTime.utcParse

const swissNumbers = formatLocale({
  decimal: ',',
  thousands: '\u2019',
  grouping: [3],
  currency: ['CHF\u00a0', ''],
})

const chf4Format = swissNumbers.format('$.0f')
const chf5Format = swissNumbers.format('$,.0f')

const formatPrice = (price) => (price / 100.0).toFixed(2)

const formatPriceChf = (value) => {
  if (String(Math.round(value)).length > 4) {
    return chf5Format(value)
  }
  return chf4Format(value)
}

const count4Format = swissNumbers.format('.0f')
const count5Format = swissNumbers.format(',.0f')

const countFormat = (value) => {
  if (String(Math.round(value)).length > 4) {
    return count5Format(value)
  }
  return count4Format(value)
}

module.exports = {
  timeahead,
  swissTime,
  timeFormat,
  timeParse,
  utcTimeFormat,
  utcTimeParse,
  formatPrice,
  formatPriceChf,
  countFormat,
}
