import GridTeaser from '@/app/(sanity)/components/teaser/grid'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
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

export function TeaserGrid({
  teasers,
  series,
  title,
}: {
  teasers: TeaserFragmentType[]
  series: boolean
  title?: string
}) {
  const withoutHeading = series ? teasers.filter((t) => !t.heading?.title) : teasers
  const withHeading = series ? teasers.filter((t) => !!t.heading?.title) : []

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
        {withoutHeading.map((teaser, index) => (
          <GridTeaser key={teaser._id} teaser={teaser} label={series ? `Folge ${index + 1}` : undefined} />
        ))}
        {withHeading.map((teaser) => (
          <GridTeaser key={teaser._id} teaser={teaser} label={teaser.heading!.title} />
        ))}
      </div>
    </>
  )
}
