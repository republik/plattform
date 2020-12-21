import { timeMonday, timeWeek, timeDay } from 'd3-time'
import { swissTime } from '../../lib/utils/format'
import { group } from 'd3-array'
import { TEMPLATE_PREFIX } from '../../lib/settings'

export const now = new Date()

export const urlDateFormat = '%Y-%m-%d'
export const urlDateHourFormat = '%Y-%m-%dT%H:%M'
export const datePickerFormat = '%d.%m.%y'
export const columnDateFormat = '%A, %d.%m'

export const getUrlDate = swissTime.format(urlDateFormat)
export const parseUrlDate = swissTime.parse(urlDateFormat)

export const reformatUrlDate = (urlDate, dateFormat) => {
  const date = parseUrlDate(urlDate)
  return swissTime.format(dateFormat)(date)
}

export const getIsoDate = (urlDate, time) =>
  swissTime
    .parse(urlDateHourFormat)(`${urlDate}T${time}`)
    .toISOString()

export const getUrlWeekStart = date => getUrlDate(timeMonday.floor(date))

export const getUrlWeekEnd = date => getUrlDate(timeMonday.ceil(date))

export const offsetUrlWeek = (urlDate, offset) => {
  const date = parseUrlDate(urlDate)
  const offsetDate = timeWeek.offset(date, offset)
  return getUrlDate(offsetDate)
}

export const isCurrentWeek = urlDate =>
  +timeMonday.floor(now) === +parseUrlDate(urlDate)

export const isPast = urlDate => +timeDay.floor(now) > +parseUrlDate(urlDate)

export const getDaysFromUrl = (urlDateFrom, urlDateUntil) =>
  timeDay
    .range(parseUrlDate(urlDateFrom), parseUrlDate(urlDateUntil))
    .map(getUrlDate)

export const matchWeekDays = (urlDate, weekDays) =>
  weekDays.includes(parseInt(reformatUrlDate(urlDate, '%u')))

export const getPublicationCalendar = (from, until, repos) => {
  if (!from || !until) return []
  const reposByDay = group(repos, repo =>
    getUrlDate(new Date(repo.meta.publishDate))
  )
  return getDaysFromUrl(from, until).map(day => ({
    date: day,
    repos: reposByDay.get(day) || []
  }))
}

export const getPlaceholders = (placeholders = [], date) => {
  return placeholders.filter(placeholder =>
    matchWeekDays(date, placeholder.publicationDays)
  )
}

export const getSpecialPrefix = templateId =>
  templateId.split('/')[1].replace(TEMPLATE_PREFIX, '')

export const containsRepoFromTemplate = (repos, templateRepoId) =>
  !!repos.find(repo =>
    repo.id.split('/')[1].startsWith(getSpecialPrefix(templateRepoId))
  )

export const reformatPlaceholder = (placeholder, publishDate) => ({
  ...placeholder,
  meta: {
    publishDate: getIsoDate(publishDate, placeholder.publicationTime)
  },
  isPlaceholder: true
})
