import { GraphqlContext } from '@orbiting/backend-modules-types'
import { getFeed, NextReadsResolverArgs } from '../../../lib'

export = async function nextReads(
  _root: never,
  _: NextReadsResolverArgs,
  ctx: GraphqlContext,
) {
  const repoIds = await getFeed(ctx.pgdb, 'POPULAR_LAST_7_DAYS')
  const documents = await ctx.loaders.Document.byRepoId.loadMany(repoIds)

  return [
    {
      id: 'popular_last_7_days',
      documents: documents,
    },
  ]
}
