import { GraphqlContext } from '@orbiting/backend-modules-types'
import createDataLoader from '@orbiting/backend-modules-dataloader'

export default function (ctx: GraphqlContext) {
  return {
    byId: createDataLoader((ids: readonly string[]) => {
      if (ids.length === 0) {
        return Promise.resolve([])
      }

      return ctx.pgdb.public.pledges.find({ id: ids })
    }),
  }
}
