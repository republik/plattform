import dayjs, { Dayjs } from 'dayjs'

import { encode, decode } from '@orbiting/backend-modules-base64u'
import { User } from '@orbiting/backend-modules-types'

interface CalendarIdentifier {
  userId?: string
  calendarSlug: string
  key?: string
}

export function stringify(object: CalendarIdentifier): string {
  const { userId, calendarSlug, key } = object

  const id = [
    userId && `userId:${userId}`,
    `calendarSlug:${calendarSlug}`,
    key && `key:${key}`,
  ]
    .filter(Boolean)
    .join('/')

  return encode(id)
}

function toObject(curr: CalendarIdentifier, part: string) {
  const [name, value] = part.split(':')

  return {
    ...curr,
    [name]: value,
  }
}

export function parse(id: string): CalendarIdentifier {
  return decode(id).split('/').reduce(toObject, { calendarSlug: '' })
}

export function isKeyValid(key: string): boolean {
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false
  }

  // parseable?
  if (!dayjs(key).isValid()) {
    return false
  }

  return true
}

interface CreateEvaluateArguments {
  calendar: CalendarRow
  slots: SlotRow[]
  users: User[]
  user: User
}

interface CalendarRow {
  slug: string
  limitSlotsPerKey: number
  limitWeekdays: number[]
}

interface SlotRow {
  key: string
  userId: string
}

interface EvaluateArguments {
  date: Dayjs
  key: string
}

interface CalendarSlot {
  id: string
  key: string
  userCanBook: boolean
  userHasBooked: boolean
  userCanCancel: boolean
  users: User[]
}

export function createEvaluateSlot({
  calendar,
  slots,
  users,
  user,
}: CreateEvaluateArguments) {
  return function evaluateSlot({ date, key }: EvaluateArguments): CalendarSlot {
    const today = dayjs().startOf('day')

    const isInFuture = !today.isAfter(date)
    const isOnAllowedWeekday = calendar.limitWeekdays.includes(date.day())

    const keySlots = slots.filter((slot) => slot.key === key)
    const isSlotAvailable =
      keySlots.filter((slot) => slot.userId !== user.id).length <
      calendar.limitSlotsPerKey

    const userHasBooked = !!keySlots.find((slot) => slot.userId === user.id)

    return {
      id: stringify({ userId: user.id, calendarSlug: calendar.slug, key }),
      key,
      userCanBook:
        isInFuture && isOnAllowedWeekday && isSlotAvailable && !userHasBooked,
      userHasBooked,
      userCanCancel: isInFuture && userHasBooked,
      users: users.filter((user) =>
        keySlots.map((slot) => slot.userId).includes(user.id),
      ),
    }
  }
}
