import {
  Document,
  DocumentRecommendationsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css, cx } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'
import { CategoryLabel, getAuthors } from './helpers'
import { NextReadsLoader } from './loading'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

function RecommendedRead({ document }: { document: Document }) {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative', // for the link overlay placement
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <CategoryLabel document={document} />
      <h4>
        <Link href={document.meta.path} className={linkOverlay()}>
          {document.meta.title}
        </Link>
      </h4>
      <p className='description'>{document.meta.description}</p>
      <p className='author'>{getAuthors(document.meta.contributors)}</p>
    </div>
  )
}

export function CuratedFeed({ path }: { path: string }) {
  const { data, loading } = useQuery(DocumentRecommendationsDocument, {
    variables: { path },
  })

  const documents = data?.document.meta.recommendations?.nodes as Document[]

  if (!loading && !documents?.length) return null

  return (
    <div
      className={css({
        margin: '0 auto',
        maxWidth: '695px',
        pl: '15px',
        pr: '15px',
      })}
    >
      <div className={nextReadsSection}>
        <div className={nextReadHeader}>
          <h3>Mehr zum Thema</h3>
        </div>
      </div>
      {loading ? (
        <NextReadsLoader />
      ) : (
        <div className={css({ pt: 4, pb: 16 })}>
          {documents.map((document) => (
            <RecommendedRead key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  )
}
