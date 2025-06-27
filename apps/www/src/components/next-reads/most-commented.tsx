import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { getAuthors } from '@app/components/next-reads/helpers'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import React from 'react'

type ColorType = {
  color: string
  background: string
}

const COLOURS: ColorType[] = [
  { color: '#FCFBE8', background: '#317D7F' },
  { color: '#892387', background: '#BCB0E0' },
  { color: '#5D55C7', background: '#EEADA5' },
  { color: '#FCE8F6', background: '#94355C' },
]

const MD_WIDTH = 650

export const CoverImage = ({ image }: { image: string }) => {
  return (
    <div
      className={css({
        width: '100%',
        aspectRatio: '9/16',
        md: { width: MD_WIDTH, aspectRatio: '3/4' },
      })}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

function MostCommentedCoverText({ document }: { document: Document }) {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          pt: 4,
          width: '90%',
          ml: '5%',
        }),
      )}
    >
      <h4>
        <span className={css({ fontSize: 24, md: { fontSize: 32 } })}>
          {document.meta.title}
        </span>
      </h4>
      {!document.meta.image && (
        <p className='description'>{document.meta.description}</p>
      )}
      <p className='author'>{getAuthors(document.meta.contributors)}</p>
    </div>
  )
}

function MostCommentedWithImage({ document }: { document: Document }) {
  return (
    <div
      className={css({
        width: '100%',
        position: 'relative',
        md: {
          width: MD_WIDTH,
        },
      })}
    >
      <CoverImage image={document.meta.image} />

      <div
        className={css({
          position: 'absolute',
          bottom: 0,
          width: '100%',
          paddingBottom: 16,
          color: 'white',
          background:
            'linear-gradient(180deg, rgba(7, 7, 7, 0.00) 0%, #070707 100%)',
          backdropFilter: 'blur(1px)',
        })}
      >
        <MostCommentedCoverText document={document} />
      </div>
    </div>
  )
}

function MostCommentedWithoutImage({
  document,
  colors,
}: {
  document: Document
  colors: ColorType
}) {
  const { color, background } = colors

  return (
    <div
      style={{
        backgroundColor: background,
        color: color,
      }}
      className={css({
        aspectRatio: '9/16',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        md: {
          aspectRatio: '3/4',
          width: '650px',
        },
      })}
    >
      <MostCommentedCoverText document={document} />
    </div>
  )
}

function MostCommentedRead({
  document,
  colors,
}: {
  document: Document
  colors: ColorType
}) {
  return (
    <div className={css({ position: 'relative', scrollSnapAlign: 'start' })}>
      <Link href={document.meta.path}>
        {document.meta.image ? (
          <MostCommentedWithImage document={document} />
        ) : (
          <MostCommentedWithoutImage document={document} colors={colors} />
        )}
      </Link>
    </div>
  )
}

const mostCommentedGrid = css({
  maxWidth: '3270px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateRows: 'auto',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: 1,
  mb: 1,
  mt: 12,
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  textAlign: 'center',
  md: {
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
})

export function MostCommentedFeed({ documents }: { documents: Document[] }) {
  return (
    <>
      <div className={nextReadsSection}>
        <div className={nextReadHeader}>
          <h3>Was zu reden gibt</h3>
          <p className='tagline'>Die meistkommentierten Beiträge des Monats</p>
        </div>
      </div>
      <div className={mostCommentedGrid}>
        {documents.map((document, idx) => (
          <MostCommentedRead
            key={document.id}
            document={document}
            colors={COLOURS[idx % COLOURS.length]}
          />
        ))}
      </div>
    </>
  )
}
