import { GraphqlContext } from '@orbiting/backend-modules-types'
import { KNOWN_FEEDS, NextReadsResolverArgs } from '../../../lib'

export = function (
  _root: never,
  { repoId, feeds = KNOWN_FEEDS }: NextReadsResolverArgs,
  _ctx: GraphqlContext,
) {
  console.log(repoId, feeds)

  // TODO!

  return [
    {
      id: 'popular_last_7_days',
      documents: [
        // TODO! fix document resolver
      ],
    },
  ]
}
