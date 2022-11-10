import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

interface CalendarRow {
  slug: string
  limitRoles?: string[]
}

export default module.exports = function (context: GraphqlContext) {
  const calendars: PgTable<CalendarRow> = context.pgdb.public.calendars
  const cache: boolean = context.scope === 'request'
  return {
    bySlug: createDataLoader(
      (slugs: readonly string[]) => calendars.find({ slug: slugs }),
      { cache },
      (key, rows) => rows.find((row) => row.slug === key),
    ),
  }
}
