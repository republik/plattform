import {
  Document,
  NextReadsBookmarksDocument,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { MostCommentedFeed } from '@app/components/next-reads/most-commented'
import { BookmarkedFeed } from './bookmarked'
import { MostReadFeed } from './most-read'

export function FeedsNonCurated({ repoId }: { repoId: string }) {
  const { data: nextReadsData, loading: nextReadsLoading } = useQuery(
    NextReadsDocument,
    {
      variables: { repoId },
    },
  )
  const { data: bookmarksData, loading: bookmarksLoading } = useQuery(
    NextReadsBookmarksDocument,
  )

  if (nextReadsLoading || bookmarksLoading) return null

  const bookmarks = (bookmarksData.me?.collectionItems.nodes.map(
    (node) => node.document,
  ) || []) as Document[]

  const mostRead = nextReadsData.nextReads
    .filter((feed) => feed.id === 'POPULAR_LAST_7_DAYS')[0]
    .documents.slice(0, 5) as Document[]
  
  const mostCommented = nextReadsData.nextReads
    .filter(
      (feed) => feed.id === 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT',
    )[0]
    .documents.slice(0, 5) as Document[]

  return (
    <>
      <MostReadFeed documents={mostRead} />
      {bookmarks.length ? (
        <BookmarkedFeed documents={bookmarks} />
      ) : (
        <MostCommentedFeed documents={mostCommented} />
      )}
    </>
  )
}
