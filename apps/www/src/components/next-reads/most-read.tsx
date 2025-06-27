import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { SquareCover } from '@app/components/assets/SquareCover'
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

const mostReadItemStyle = css({
  mb: 4,
  textAlign: 'left',
  scrollSnapAlign: 'start',
  scrollSnapMarginLeft: '15px',
  width: '240px',
  position: 'relative', // for the link overlay placement
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
        <h4>
          <Link href={document.meta.path} className={linkOverlay()}>
            {document.meta.title}
          </Link>
        </h4>
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

export function MostReadFeed({
  documents,
}: {
  documents: Document[] | undefined
}) {
  return (
    <div className={nextReadsSection}>
      <div className={nextReadHeader}>
        <h3>Was andere lesen</h3>
        <p className='tagline'>
          Die meistbeachteten Beiträge der letzten Woche
        </p>
      </div>
      {documents?.length ? (
        <div className={mostReadGrid}>
          {documents.map((document) => (
            <MostReadItem key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <NextReadsLoader />
      )}
    </div>
  )
}
