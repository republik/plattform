const {timeFormatLocale} = require('d3-time-format')

const swissTime = timeFormatLocale({
  'dateTime': '%A, der %e. %B %Y, %X',
  'date': '%d.%m.%Y',
  'time': '%H:%M:%S',
  'periods': ['AM', 'PM'],
  'days': ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  'shortDays': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  'months': ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  'shortMonths': ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
})

const timeFormat = swissTime.format
const timeParse = swissTime.parse
const utcTimeFormat = swissTime.utcFormat
const utcTimeParse = swissTime.utcParse

module.exports = {swissTime, timeFormat, timeParse, utcTimeFormat, utcTimeParse}

