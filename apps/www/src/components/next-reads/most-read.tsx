import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { SquareCover } from '@app/components/assets/SquareCover'
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
    <div className={cx(sectionItem, css({ marginBottom: '4' }))}>
      <Link href={document.meta.path}>
        <div className={css({ marginBottom: 6 })}>
          <SquareCover
            size={1024}
            title={document.meta.title}
            cover={document.meta.audioCover}
            crop={document.meta.audioCoverCrop}
            image={document.meta.image}
          />
        </div>
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

export function MostReadFeed({ documents }: { documents: Document[] }) {
  return (
    <div
      className={css({
        borderTop: '1px solid black',
        px: 8,
      })}
    >
      <div
        className={cx(
          sectionHeader,
          css({
            textAlign: 'center',
          }),
        )}
      >
        <h3>Was andere lesen</h3>
        <p className='tagline'>
          Die meistbeachteten Beiträge der letzten Woche
        </p>
      </div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'auto',
          gap: 8,
          mt: 16,
          mb: 16,
        })}
      >
        {documents.map((document) => (
          <RecommendedRead key={document.id} document={document} />
        ))}
      </div>
    </div>
  )
}
