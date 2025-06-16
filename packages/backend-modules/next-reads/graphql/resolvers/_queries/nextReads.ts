import { GraphqlContext } from '@orbiting/backend-modules-types'
import {
  NextReadsResolverArgs,
  PopularLast20DaysCommentsFeed,
  PopularLast7DaysFeed,
} from '../../../lib'

export = async function nextReads(
  _root: never,
  args: NextReadsResolverArgs,
  ctx: GraphqlContext,
) {
  const resolver = [
    { id: 'POPULAR_LAST_7_DAYS', resolver: new PopularLast7DaysFeed(ctx.pgdb) },
    {
      id: 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT',
      resolver: new PopularLast20DaysCommentsFeed(ctx.pgdb),
    },
  ]

  const results = await Promise.all(
    resolver.map(async (r) => ({
      id: r.id,
      documents: await (async () => {
        const ids = await r.resolver.resolve([args.repoId])
        return ctx.loaders.Document.byRepoId.loadMany(ids.map((r) => r.repoId))
      })(),
    })),
  )

  return results
}
