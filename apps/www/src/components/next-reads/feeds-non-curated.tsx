import {
  Document,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { MostCommentedFeed } from './most-commented'
import { MostReadFeed } from './most-read'

export function FeedsNonCurated({ repoId }: { repoId: string }) {
  const { data, loading } = useQuery(NextReadsDocument, {
    variables: { repoId },
  })

  if (loading || !data) return null

  const mostRead = data.nextReads
    .filter((feed) => feed.id === 'POPULAR_LAST_7_DAYS')[0]
    .documents.slice(0, 5) as Document[]

  // TODO: maybe deduplicate with MostReadFeed?
  const mostCommented = data.nextReads
    .filter(
      (feed) => feed.id === 'POPULAR_OF_THE_LAST_20_DAYS_WITH_COMMENTS_COUNT',
    )[0]
    .documents.slice(0, 5) as Document[]

  return (
    <>
      <MostReadFeed documents={mostRead} />
      <MostCommentedFeed documents={mostCommented} />
    </>
  )
}
