import {
  ProgressState,
  UserBookmarksDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { BookmarkedFeed } from '@/app/(sanity)/components/next-reads/bookmarked'
import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import { client } from '@/app/(sanity)/lib/client'
import { getClient } from '@/app/lib/apollo/client'
import { getMe } from '@/app/lib/auth/me'

// TODO: integrate next reads feeds
export async function AutomaticRecommendations({
  currentDocumentId,
}: {
  currentDocumentId: string
}) {
  const { me } = await getMe()

  if (!me) return null

  const gql = await getClient()

  const { data, error } = await gql.query({
    query: UserBookmarksDocument,
    variables: {
      names: ['bookmarks'],
      // with progress tracking opted out the API
      // returns NOTHING for an UNFINISHED filter
      progress: me.progressOptOut ? null : ProgressState.Unfinished,
    },
  })

  if (error) {
    console.error('AutomaticRecommendations', error)
    return null
  }

  const bookmarkIds = (data.collectionItems?.nodes ?? [])
    .slice(0, 5)
    .map((item) => item.sanityId)
    .filter((id) => id !== currentDocumentId)

  if (!bookmarkIds.length) return null

  const teasers = await client.fetch(
    ARTICLES_BY_IDS_QUERY,
    {
      ids: bookmarkIds,
    },
    { tag: 'next-reads' },
  )

  // ARTICLES_BY_IDS_QUERY returns documents in Sanity's own order; restore the
  // order the API returned them in (most recently bookmarked first).
  const teasersById = new Map(teasers.map((teaser) => [teaser._id, teaser]))
  const orderedTeasers = bookmarkIds
    .map((id) => teasersById.get(id))
    .filter((teaser) => teaser !== undefined)

  return (
    <div>
      <BookmarkedFeed teasers={orderedTeasers} />
    </div>
  )
}
