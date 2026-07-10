import { CarouselTeaser } from '@/app/(sanity)/components/teaser/carousel'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import {
  TEASERS_QUERY_ASC,
  TEASERS_QUERY_DESC,
} from '@/app/(sanity)/groq/teasers-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import React from 'react'

const DEFAULT_TEASERS_LIMIT = 20

const carousel = css({
  gridColumn: 'full',
  display: 'flex',
  overflowX: 'scroll',
  scrollSnapType: 'x mandatory',
  pb: '2',
  mb: '6',
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
  const { title, maxItems, series } = teaserList
  // We display series in chronological order, starting with the first episode
  const QUERY = series ? TEASERS_QUERY_ASC : TEASERS_QUERY_DESC

  const { data } = await sanityFetch({
    query: QUERY,
    params: {
      documentId,
      blockKey,
      start: 0,
      end: maxItems ?? DEFAULT_TEASERS_LIMIT,
    },
  })

  const teasers = data?.block?.teasers
  if (!teasers?.length) return null

  return (
    <>
      {!!title && (
        <h2
          className={css({
            textStyle: 'subtitleBold',
            textAlign: 'center',
            mt: '8',
          })}
        >
          {title}
        </h2>
      )}
      <div className={carousel}>
        {teasers.map((teaser) => (
          <CarouselTeaser key={teaser._id} teaser={teaser} />
        ))}
      </div>
    </>
  )
}
