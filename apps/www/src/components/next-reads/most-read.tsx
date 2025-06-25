import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { SquareCover } from '@app/components/assets/SquareCover'
import { CategoryLabel, getAuthors } from '@app/components/next-reads/helpers'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'

const mostReadItemStyle = css({
  mb: 4,
  textAlign: 'left',
  scrollSnapAlign: 'start',
  scrollSnapMarginLeft: '15px',
  width: '240px',
  lg: {
    width: 'auto',
  },
})

function MostReadItem({ document }: { document: Document }) {
  return (
    <div className={cx(nextReadItemTypography, mostReadItemStyle)}>
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
        <p className='author'>{getAuthors(document.meta.contributors)}</p>
      </Link>
    </div>
  )
}

const mostReadGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridTemplateRows: 'auto',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  gap: 8,
  mt: 12,
  pb: 8,
  mx: '15px',
  md: {
    mx: 8,
    pb: 16,
  },
})

export function MostReadFeed({ documents }: { documents: Document[] }) {
  return (
    <div className={nextReadsSection}>
      <div className={nextReadHeader}>
        <h3>Was andere lesen</h3>
        <p className='tagline'>
          Die meistbeachteten Beiträge der letzten Woche
        </p>
      </div>
      <div className={mostReadGrid}>
        {documents.map((document) => (
          <MostReadItem key={document.id} document={document} />
        ))}
      </div>
    </div>
  )
}
