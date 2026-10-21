import { formatLocale } from 'd3-format'
import { timeFormatLocale } from 'd3-time-format'
import timeDefinition from 'd3-time-format/locale/de-CH'

export const thousandSeparator = '\u2019'
export const swissNumbers = formatLocale({
  decimal: ',',
  thousands: thousandSeparator,
  grouping: [3],
  currency: ['CHF\u00a0', ''],
  minus: '\u2212',
  percent: '\u2009%',
})

const count4Format = swissNumbers.format('.0f')
const count5Format = swissNumbers.format(',.0f')
export const countFormat = (value) => {
  if (String(Math.round(value)).length > 4) {
    return count5Format(value)
  }
  return count4Format(value)
}

export const swissTime = timeFormatLocale(timeDefinition)
export const timeFormat = swissTime.format

// "1. Januar 2026", with non-breaking spaces so the date never wraps
export const dateFormat = '%-d.\u00a0%B\u00a0%Y'
export const formatDate = swissTime.format(dateFormat)

export const formatExcerpt = (string) =>
  '... ' + string.replace(/\.+$/, '') + '...'

export const capitalize = (word) =>
  word && word.charAt(0).toUpperCase() + word.slice(1)
