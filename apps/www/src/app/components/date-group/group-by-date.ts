import {
  formatDate,
  formatDateKey,
  formatWeekday,
} from '@/app/lib/util/time-format'

type DateLike = string | number | Date

export type DateGroupType<T> = {
  key: string
  label: string
  labelLg: string
  items: T[]
}

/**
 * Groups consecutive items that fall on the same day (in Zurich). Expects the
 * items to be sorted by date; items without a date are grouped under `unknown`.
 */
export function groupByDate<T>(
  items: T[],
  getDate: (item: T) => DateLike | null | undefined,
): DateGroupType<T>[] {
  const groups: DateGroupType<T>[] = []
  for (const item of items) {
    const value = getDate(item)
    const date = value ? new Date(value) : null
    const key = date ? formatDateKey(date) : 'unknown'
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = {
        key,
        label: date ? `${formatWeekday(date)}, ${formatDate(date)}` : '',
        labelLg: date ? `${formatWeekday(date)},\n${formatDate(date)}` : '',
        items: [],
      }
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}
