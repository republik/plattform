import dayjs from 'dayjs'

import { encode, decode } from '@orbiting/backend-modules-base64u'

interface CalendarIdentifier {
  calendarSlug: string
  key?: string
}

export function stringify(object: CalendarIdentifier): string {
  const { calendarSlug, key } = object

  const id = [`calendarSlug:${calendarSlug}`, key && `key:${key}`]
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
