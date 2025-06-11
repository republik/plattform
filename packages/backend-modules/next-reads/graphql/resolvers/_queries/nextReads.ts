import { GraphqlContext } from '@orbiting/backend-modules-types'
import { NextReadsResolverArgs, PopularLast7DaysFeed } from '../../../lib'

export = async function nextReads(
  _root: never,
  _: NextReadsResolverArgs,
  ctx: GraphqlContext,
) {
  const repoIds = await new PopularLast7DaysFeed(ctx.pgdb).resolve()
  const documents = ctx.loaders.Document.byRepoId.loadMany(repoIds)

  return [
    {
      id: 'POPULAR_LAST_7_DAYS',
      documents: documents,
    },
  ]
}
