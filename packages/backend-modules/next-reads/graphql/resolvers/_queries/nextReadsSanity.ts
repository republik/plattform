import { GraphqlContext } from '@orbiting/backend-modules-types'
import { fetchDocumentsByIds, isCollectableType } from '@orbiting/backend-modules-sanity'
import {
  SanityNextReadsResolverArgs,
  SanityNextReadsResolverResult,
  SanityPopularLast20DaysCommentsFeed,
  SanityPopularLast7DaysFeed,
} from '../../../lib'

const DAYS_SINCE_PUBLISH_CUTOFF = 20
const MS_PER_DAY = 1000 * 60 * 60 * 24

export = async function nextReadsSanity(
  _root: never,
  args: SanityNextReadsResolverArgs,
  ctx: GraphqlContext,
) {
  const resolvers = [
    {
      id: 'POPULAR_LAST_7_DAYS',
      resolver: new SanityPopularLast7DaysFeed(ctx.pgdb),
      enforceRecency: false,
    },
    {
      id: 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT',
      resolver: new SanityPopularLast20DaysCommentsFeed(ctx.pgdb),
      enforceRecency: true,
    },
  ]

  const results = await Promise.all(
    resolvers.map(async (r) => {
      const scored = await r.resolver.resolve([args.documentId])
      if (!scored.length) {
        return { id: r.id, documents: [] }
      }

      // Publish state, document kind and (for the comments feed) recency
      // can't be checked in SQL for Sanity content -- resolve the shortlist
      // (capped at 30 by the SQL query above) against Sanity once here.
      // An id that doesn't resolve is simply unpublished/deleted and drops
      // out, for free, under the `published` perspective.
      const docs = await fetchDocumentsByIds(scored.map((s) => s.sanityId))
      const docById = new Map(docs.map((doc) => [doc._id, doc]))
      const now = Date.now()

      const documents = scored
        .map((s: SanityNextReadsResolverResult) => ({
          score: s.score,
          doc: docById.get(s.sanityId),
        }))
        .filter(({ doc }) => !!doc && isCollectableType(doc._type))
        .filter(({ doc }) => {
          if (!r.enforceRecency) return true
          if (!doc!.publishDate) return false
          const daysSincePublish =
            (now - new Date(doc!.publishDate).getTime()) / MS_PER_DAY
          return daysSincePublish <= DAYS_SINCE_PUBLISH_CUTOFF
        })
        .sort((a, b) => b.score - a.score)
        .map(({ doc }) => ({ id: doc!._id, type: doc!._type }))

      return { id: r.id, documents }
    }),
  )

  return results
}
