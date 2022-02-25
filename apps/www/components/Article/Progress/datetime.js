import { timeFormat, formatDate } from '../../../lib/utils/format'

const MS_PER_DAY = 60 * 60 * 24 * 1000

const getLastMidnight = () => {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  return today
}

const DateTime = (
  t,
  date,
  baseKey = 'progress',
  lastMidnight = getLastMidnight(),
) => {
  const diff = date - lastMidnight

  const formatTime = timeFormat('%H:%M')

  const displayDay =
    diff > 0
      ? t(`${baseKey}/time/today`)
      : diff > -MS_PER_DAY
      ? t(`${baseKey}/time/yesterday`)
      : t(`${baseKey}/time/other`, { date: formatDate(date) })
  const displayTime = formatTime(date)

  return t(`${baseKey}/time`, {
    day: displayDay,
    time: displayTime,
  })
}
export default DateTime
