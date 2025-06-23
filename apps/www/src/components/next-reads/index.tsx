import {
  Document,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'

import { CuratedFeed } from './curated'
import { MostCommentedFeed } from './most-commented'
import { MostReadFeed } from './most-read'

function NextReads() {
  const { data, loading } = useQuery(NextReadsDocument)

  if (loading) return null

  const curatedReads = data.documents.nodes
    .slice(0, 3)
    .map((n) => n.entity) as Document[]
  const mostRead = data.documents.nodes
    .slice(3, 8)
    .map((n) => n.entity) as Document[]
  const mostCommented = data.documents.nodes
    .slice(8, 13)
    .map((n) => n.entity) as Document[]

  return (
    <div className={css({ pt: 16 })}>
      <CuratedFeed documents={curatedReads} />
      <MostReadFeed documents={mostRead} />
      <MostCommentedFeed documents={mostCommented} />
    </div>
  )
}

export default NextReads
