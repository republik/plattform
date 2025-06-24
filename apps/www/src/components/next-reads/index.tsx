import {
  Document,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'

import { CuratedFeed } from './curated'
import { MostCommentedFeed } from './most-commented'
import { MostReadFeed } from './most-read'

function NextReads({ repoId, path }: { repoId: string; path: string }) {
  const { data, loading } = useQuery(NextReadsDocument, {
    variables: { repoId, path },
  })

  if (loading || !data) return null

  const curatedReads = data.CURATED_READS.meta.recommendations
    .nodes as Document[]

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
    <div className={css({ pt: 16 })}>
      <CuratedFeed documents={curatedReads} />
      <MostReadFeed documents={mostRead} />
      <MostCommentedFeed documents={mostCommented} />
    </div>
  )
}

export default NextReads
