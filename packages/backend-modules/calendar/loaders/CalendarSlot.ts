import { PgTable } from 'pogi'

import createDataLoader, {
  StringObject,
} from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

interface CalendarSlotRow {
  id: string
  calendarSlug: string
  userId: string
  key: string
  createdAt: Date
  revokedAt?: Date
}

export default module.exports = function (context: GraphqlContext) {
  const calendarSlots: PgTable<CalendarSlotRow> =
    context.pgdb.public.calendarSlots
  const cache: boolean = context.scope === 'request'
  return {
    byKeyObj: createDataLoader(
      async (keyObjs: readonly StringObject[]) =>
        calendarSlots.find(
          {
            or: keyObjs.map((keyObj) => ({
              and: keyObj,
            })),
          },
          {
            // return latest row per user per per key
            fields: ['DISTINCT ON ("key", "userId") *'],
            orderBy: { key: 'asc', userId: 'asc', createdAt: 'desc' },
          },
        ),
      { cache, many: true },
    ),
  }
}
