import {
  ProgressState,
  UserBookmarksDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import {
  BookmarksFeedClient,
  type TeaserFeedData,
} from '@/app/(sanity)/lesezeichen/components/bookmarks-feed-client'
import { fetchBookmarkTeasersByIds } from '@/app/(sanity)/lesezeichen/components/fetch-bookmark-teasers'
import { getClient } from '@/app/lib/apollo/client'

export async function BookmarksFeed({ collection }: { collection: string }) {
  async function fetchPage(after?: string): Promise<TeaserFeedData> {
    'use server'

    // Wrap GraphQL API calls in try/catch because Apollo Client will throw on networkError
    try {
      const gql = await getClient()

      const { data, error } = await gql.query({
        query: UserBookmarksDocument,
        variables: {
          names:
            collection === 'progress'
              ? ['progress', 'bookmarks']
              : [collection],
          progress: collection === 'progress' ? ProgressState.Unfinished : null,
          after,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      const items = data.collectionItems?.nodes ?? []
      const teasers = await fetchBookmarkTeasersByIds(
        items.map((b) => b.sanityId),
      )

      return {
        hasMore: data.collectionItems?.pageInfo?.hasNextPage ?? false,
        after: data.collectionItems?.pageInfo?.endCursor,
        teasers,
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }

  const initialTeasers = await fetchPage()

  return (
    <div>
      <BookmarksFeedClient
        key={collection}
        initialData={initialTeasers}
        loadMoreAction={fetchPage}
      />
    </div>
  )

  /**/
}
