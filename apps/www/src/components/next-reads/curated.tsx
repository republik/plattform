import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { sectionHeader, sectionItem } from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'

function CategoryLabel({ document }: { document: Document }) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null
  // set fomat color as text color
  return <h5 className={css({ color: 'red' })}>{text}</h5>
}

function RecommendedRead({ document }: { document: Document }) {
  return (
    <div
      className={cx(
        sectionItem,
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
        <p className='author'>
          Von{' '}
          {document.meta.contributors
            .filter((contributor) => contributor.kind.includes('Text'))
            .map((contributor) => contributor.name)
            .join(', ')}
        </p>
      </Link>
    </div>
  )
}

export function CuratedFeed({ documents }: { documents: Document[] }) {
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
        <div className={sectionHeader}>
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
