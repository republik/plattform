import { CarouselTeaser } from '@/app/(sanity)/components/teaser/carousel'
import { CAROUSEL_BLOCK_QUERY } from '@/app/(sanity)/groq/carousel-block-query'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import React from 'react'

const DEFAULT_TEASERS_LIMIT = 5

const carouselGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridTemplateRows: 'auto',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  gap: 0,
  mt: 12,
  md: {
    mx: 8,
  },
})

const carouselHeader = css({
  mt: 8,
  mb: 8,
  '& h3': {
    textStyle: 'subtitleBold',
    mb: 4,
  },
  '& .tagline': {
    fontFamily: 'rubis',
    fontWeight: 300,
    fontStyle: 'italic',
    fontSize: 16,
  },
})

export async function Carousel({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const { data } = await sanityFetch({
    query: CAROUSEL_BLOCK_QUERY,
    params: {
      documentId,
      blockKey,
      start: 0,
      end: teaserList.maxItems ?? DEFAULT_TEASERS_LIMIT,
    },
  })

  const teasers = data?.block?.teasers
  if (!teasers?.length) return null

  return (
    <div
      className={css({
        mb: '-6',
        mt: '8',
        textAlign: 'center',
        gridColumn: 'breakout',
      })}
    >
      <div className={carouselHeader}>
        <h3>CAROUSEL</h3>
      </div>
      <div className={carouselGrid}>
        {teasers.map((teaser) => (
          <CarouselTeaser key={teaser._id} teaser={teaser} />
        ))}
      </div>
    </div>
  )
}
