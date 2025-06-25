import {
  Document,
  DocumentRecommendationsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { CategoryLabel, getAuthors } from '@app/components/next-reads/helpers'
import {
  nextReadHeader,
  nextReadItemTypography,
} from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'

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
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <Link href={document.meta.path}>
        <CategoryLabel document={document} />
        <h4>{document.meta.title}</h4>
        <p className='description'>{document.meta.description}</p>
        <p className='author'>{getAuthors(document.meta.contributors)}</p>
      </Link>
    </div>
  )
}

export function CuratedFeed({ path }: { path: string }) {
  const { data, loading } = useQuery(DocumentRecommendationsDocument, {
    variables: { path },
  })

  if (loading || !data) return null

  const documents = data.document.meta.recommendations.nodes as Document[]

  return (
    <div
      className={css({
        margin: '0 auto',
        maxWidth: '695px',
        pl: '15px',
        pr: '15px',
      })}
    >
      <div className={css({ borderTop: '1px solid black' })}>
        <div className={nextReadHeader}>
          <h3>Mehr zum Thema</h3>
        </div>
        <div className={css({ pt: 4, pb: 16 })}>
          {documents.map((document) => (
            <RecommendedRead key={document.id} document={document} />
          ))}
        </div>
      </div>
    </div>
  )
}
