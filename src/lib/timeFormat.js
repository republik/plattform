import { timeFormatLocale } from 'd3-time-format'
import timeDefinition from 'd3-time-format/locale/de-CH'

const locale = timeFormatLocale(timeDefinition)

export const timeFormat = locale.format
export const timeParse = locale.parse
