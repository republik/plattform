import {
  NextReadsSanityDocument,
  ProgressState,
  UserBookmarksDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { BookmarkedFeed } from '@/app/(sanity)/components/next-reads/bookmarked'
import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import { BookmarksFeedClient, TeaserFeedData } from '@/app/(sanity)/lesezeichen/components/bookmarks-feed-client'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { getClient } from '@/app/lib/apollo/client'
import { useQuery } from '@apollo/client'
import { MostCommentedFeed } from './most-commented'
import { MostReadFeed } from './most-read'

export function AutomaticRecommendations() {
  const { loading, data } = await useQuery(
    UserBookmarksDocument,
    {
      variables: { names: ['bookmarks'] },
    },
  )


      const items = data?.collectionItems?.nodes ?? []

      const { data: teasers } = await sanityFetch({
        query: ARTICLES_BY_IDS_QUERY,
        params: { ids: items.map((bookmark) => bookmark.sanityId) },
      })
    }

  /*
  const { loading: nextReadsLoading, data: nextReadsData } = useQuery(
    NextReadsSanityDocument,
    {
      variables: { documentId },
    },
  )
  const mostReadIds = nextReadsData?.nextReads
    .filter((feed) => feed.id === 'POPULAR_LAST_7_DAYS')[0]
    .documents.slice(0, 5)

  const mostCommentedIds = nextReadsData?.nextReads
    .filter(
      (feed) => feed.id === 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT',
    )[0]
    .documents.slice(0, 6)
    */

    return (
      <div>
        <BookmarkedFeed
          key={collection}
          teasers={teasers}
        />
      </div>
    )
}
