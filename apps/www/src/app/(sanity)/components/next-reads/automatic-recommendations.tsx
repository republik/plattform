import {
  NextReadsDocument,
  ProgressState,
  UserBookmarksDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { BookmarkedFeed } from '@/app/(sanity)/components/next-reads/bookmarked-feed'
import { MostCommentedFeed } from '@/app/(sanity)/components/next-reads/most-commented'
import { MostReadFeed } from '@/app/(sanity)/components/next-reads/most-read'
import { getClient } from '@/app/lib/apollo/client'
import { getMe } from '@/app/lib/auth/me'
import { css } from '@republik/theme/css'

const MOST_READ_FEED_ID = 'POPULAR_LAST_7_DAYS'
const MOST_COMMENTED_FEED_ID = 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT'

export async function AutomaticRecommendations({
  currentDocumentId,
}: {
  currentDocumentId: string
}) {
  // Wrap GraphQL API calls in try/catch because Apollo Client will throw on networkError
  try {
    const { me } = await getMe()

    const gql = await getClient()

    const [{ data: nextReadsData }, bookmarksResult] = await Promise.all([
      gql.query({
        query: NextReadsDocument,
        variables: {
          documentId: currentDocumentId,
        },
      }),
      // bookmarks are only available to logged-in users
      me
        ? gql.query({
            query: UserBookmarksDocument,
            variables: {
              names: ['bookmarks'],
              // with progress tracking opted out the API
              // returns NOTHING for an UNFINISHED filter
              progress: me.progressOptOut ? null : ProgressState.Unfinished,
            },
          })
        : null,
    ])

    const feedIds = (feedId: string, limit: number) =>
      (
        nextReadsData?.nextReadsSanity?.find((feed) => feed.id === feedId)
          ?.documents ?? []
      )
        .map((document) => document.id)
        .slice(0, limit)

    const mostReadIds = feedIds(MOST_READ_FEED_ID, 5)
    const mostCommentedIds = feedIds(MOST_COMMENTED_FEED_ID, 6)

    const bookmarkIds = (bookmarksResult?.data?.collectionItems?.nodes ?? [])
      .map((item) => item.sanityId)
      .filter((id): id is string => !!id && id !== currentDocumentId)
      .slice(0, 5)

    return (
      <div className={css({ _print: { display: 'none' } })}>
        <MostReadFeed ids={mostReadIds} />
        {bookmarkIds.length > 0 ? (
          <BookmarkedFeed ids={bookmarkIds} />
        ) : (
          <MostCommentedFeed ids={mostCommentedIds} />
        )}
      </div>
    )
  } catch (e) {
    // No need to report or log error
    return null
  }
}
