import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { sectionHeader, sectionItem } from '@app/components/next-reads/styles'
import { css } from '@republik/theme/css'

function CategoryLabel({ document }: { document: Document }) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null
  // set fomat color as text color
  return <h5 className={css({ color: 'red' })}>{text}</h5>
}

function RecommendedRead({ document }: { document: Document }) {
  return (
    <div className={sectionItem}>
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
    </div>
  )
}

export function CuratedFeed({ documents }: { documents: Document[] }) {
  return (
    <div
      className={css({
        borderTop: '1px solid black',
        margin: '0 auto',
        maxWidth: '665px',
      })}
    >
      <div className={sectionHeader}>
        <h3>Mehr zum Thema</h3>
      </div>
      {documents.map((document) => (
        <div
          key={document.id}
          className={css({
            marginBottom: '4',
            py: 4,
            // exclude last item from border
            borderBottom: '1px solid black',
            '&:last-of-type': { borderBottom: 'none' },
          })}
        >
          <RecommendedRead document={document} />
        </div>
      ))}
    </div>
  )
}
