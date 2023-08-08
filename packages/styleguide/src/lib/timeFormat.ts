import { timeFormatLocale } from 'd3-time-format'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import timeDefinition from 'd3-time-format/locale/de-CH'
console.log('timeDefinition', timeDefinition)
const locale = timeFormatLocale(timeDefinition)

export const timeFormat = locale.format
export const timeParse = locale.parse
