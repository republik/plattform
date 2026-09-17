import {
  ProgressState,
  UserBookmarksDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import {
  BookmarksFeedClient,
  type TeaserFeedData,
} from '@/app/(sanity)/lesezeichen/components/bookmarks-feed-client'
import { client } from '@/app/(sanity)/lib/client'
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

    const teasers = await client.fetch(
      ARTICLES_BY_IDS_QUERY,
      {
        ids: items.map((b) => b.sanityId),
      },
      { tag: 'bookmarks-feed' },
    )

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
