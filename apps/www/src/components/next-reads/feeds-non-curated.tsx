import {
  Document,
  NextReadsBookmarksDocument,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { BookmarkedFeed } from './bookmarked'
import { MostCommentedFeed } from './most-commented'
import { MostReadFeed } from './most-read'

export function FeedsNonCurated({ repoId }: { repoId: string }) {
  const { data: nextReadsData } = useQuery(NextReadsDocument, {
    variables: { repoId },
  })
  const { data: bookmarksData } = useQuery(NextReadsBookmarksDocument)

  const bookmarks = (bookmarksData?.me?.collectionItems.nodes.map(
    (node) => node.document,
  ) || []) as Document[]

  const mostRead = nextReadsData?.nextReads
    .filter((feed) => feed.id === 'POPULAR_LAST_7_DAYS')[0]
    .documents.slice(0, 5) as Document[]

  const mostCommented = nextReadsData?.nextReads
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
