import { getFragmentData } from '#graphql/republik-api/__generated__/gql'
import {
  NextReadDocumentFieldsFragmentDoc,
  NextReadsBookmarksDocument,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { BookmarkedFeed } from './bookmarked'
import { MostCommentedFeed } from './most-commented'
import { MostReadFeed } from './most-read'

export function FeedsNonCurated({ repoId }: { repoId: string }) {
  const { loading: nextReadsLoading, data: nextReadsData } = useQuery(
    NextReadsDocument,
    {
      variables: { repoId },
    },
  )
  const { data: bookmarksData } = useQuery(NextReadsBookmarksDocument, {
    variables: { repoId },
    fetchPolicy: 'network-only',
  })

  const bookmarks = bookmarksData?.me?.collectionItems.nodes
    // apparently not all bookmarks have a document...?
    .filter((node) => node.document)
    .map(({ document }) =>
      getFragmentData(NextReadDocumentFieldsFragmentDoc, document),
    )

  const mostRead = nextReadsData?.nextReads
    .filter((feed) => feed.id === 'POPULAR_LAST_7_DAYS')[0]
    .documents.slice(0, 5)
    .map((document) =>
      getFragmentData(NextReadDocumentFieldsFragmentDoc, document),
    )

  const mostCommented = nextReadsData?.nextReads
    .filter(
      (feed) => feed.id === 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT',
    )[0]
    .documents.slice(0, 6)
    .map((document) =>
      getFragmentData(NextReadDocumentFieldsFragmentDoc, document),
    )

  return (
    <>
      <MostReadFeed documents={mostRead} loading={nextReadsLoading} />
      {bookmarks?.length ? (
        <BookmarkedFeed documents={bookmarks} />
      ) : (
        <MostCommentedFeed
          documents={mostCommented}
          loading={nextReadsLoading}
        />
      )}
    </>
  )
}
