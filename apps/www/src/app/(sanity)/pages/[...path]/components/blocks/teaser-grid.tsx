import GridTeaser from '@/app/(sanity)/components/teaser/grid'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import {
  TEASERS_SMALL_QUERY_ASC,
  TEASERS_SMALL_QUERY_DESC,
} from '@/app/(sanity)/groq/teasers-small-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import React from 'react'

const gridStyle = css({
  gridColumn: 'breakout',
  display: 'grid',
  gridTemplateColumns: '1fr',
  md: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  lg: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  columnGap: '4',
  rowGap: '12',
})

function getSeriesLabels(teasers: any[]) {
  const labels = []
  let firstEpisode = 1
  for (const teaser of teasers) {
    // TODO: add use case of a label on the teaser
    if (teaser.heading?.title) {
      labels.push(teaser.heading.title)
    } else {
      labels.push(`Folge ${firstEpisode}`)
      firstEpisode++
    }
  }
  return labels
}

export async function TeaserGrid({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const { title, series, maxItems, total } = teaserList

  // We display series in chronological order, starting with the first episode
  const QUERY = series ? TEASERS_SMALL_QUERY_ASC : TEASERS_SMALL_QUERY_DESC

  const { data } = await sanityFetch({
    query: QUERY,
    params: {
      documentId,
      blockKey,
      start: 0,
      end: maxItems ?? total,
    },
  })

  const teasers = data?.block?.teasers
  if (!teasers?.length) return null

  const labels = series && getSeriesLabels(teasers)

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
      <div className={gridStyle}>
        {teasers.map((teaser, index) => (
          <GridTeaser
            key={teaser._id}
            teaser={teaser}
            label={labels && labels[index]}
          />
        ))}
        {/*upcomingTeasers.map((teaser, index) => (
          <GridTeaser
            comingSoon={true}
            key={teaser._id}
            teaser={teaser}
            label={
              series ? `Folge ${index + 1 + withoutHeading.length}` : undefined
            }
          />
        ))*/}
      </div>
    </>
  )
}
