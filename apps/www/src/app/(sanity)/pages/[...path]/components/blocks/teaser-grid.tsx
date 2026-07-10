import GridTeaser from '@/app/(sanity)/components/teaser/grid/teaser-grid'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { css } from '@republik/theme/css'
import React from 'react'

const gridStyle = css({
  gridColumn: 'breakout',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  columnGap: '4',
  rowGap: '12',
})

export function TeaserGrid({
  teasers,
  title,
}: {
  teasers: TeaserFragmentType[]
  title?: string
}) {
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
        {teasers.map((teaser) => (
          <GridTeaser key={teaser._id} teaser={teaser} />
        ))}
      </div>
    </>
  )
}
