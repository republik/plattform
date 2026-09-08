import { UserBookmarksDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import {
  BookmarksFeedClient,
  type TeaserFeedData,
} from '@/app/(sanity)/lesezeichen/components/bookmarks-feed-client'
import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { getClient } from '@/app/lib/apollo/client'

const INITIAL_SIZE = 100
const PAGE_SIZE = 20

export async function BookmarksFeed({ collection }: { collection: string }) {
  async function fetchPage(after?: string): Promise<TeaserFeedData> {
    'use server'

    const gql = await getClient()

    const { data, error } = await gql.query({
      query: UserBookmarksDocument,
      variables: {
        collectionName: collection,
        after,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    const items = data.userCollectionItems?.nodes ?? []

    const { data: teasers } = await sanityFetch({
      query: ARTICLES_BY_IDS_QUERY,
      params: { ids: items.map((b) => b.sanityId) },
    })

    return {
      hasMore: data.userCollectionItems?.pageInfo?.hasNextPage ?? false,
      after: data.userCollectionItems?.pageInfo?.endCursor,
      teasers: teasers ?? [],
    }
  }

  const initialTeasers = await fetchPage()

  // if (!initialTeasers.length) return null

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
