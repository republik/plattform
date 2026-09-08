import {
  ProgressState,
  UserBookmarksDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import {
  BookmarksFeedClient,
  type TeaserFeedData,
} from '@/app/(sanity)/lesezeichen/components/bookmarks-feed-client'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { getClient } from '@/app/lib/apollo/client'

export async function BookmarksFeed({ collection }: { collection: string }) {
  async function fetchPage(after?: string): Promise<TeaserFeedData> {
    'use server'

    const gql = await getClient()

    const { data, error } = await gql.query({
      query: UserBookmarksDocument,
      variables: {
        names:
          collection === 'progress' ? ['progress', 'bookmarks'] : [collection],
        progress: collection === 'progress' ? ProgressState.Unfinished : null,
        after,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    const items = data.collectionItems?.nodes ?? []

    const { data: teasers } = await sanityFetch({
      query: ARTICLES_BY_IDS_QUERY,
      params: { ids: items.map((b) => b.sanityId) },
    })

    return {
      hasMore: data.collectionItems?.pageInfo?.hasNextPage ?? false,
      after: data.collectionItems?.pageInfo?.endCursor,
      teasers: teasers ?? [],
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
