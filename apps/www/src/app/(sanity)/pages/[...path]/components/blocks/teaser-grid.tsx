import GridTeaser from '@/app/(sanity)/components/teaser/grid'
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
  series,
  title,
}: {
  teasers: TeaserFragmentType[]
  series: boolean
  title?: string
}) {
  // label per teaser: its heading, or a sequential episode number
  const labels: string[] = []

  if (series) {
    let episode = 1
    for (const teaser of teasers) {
      labels.push(teaser.heading?.title ?? `Folge ${episode++}`)
    }
  }

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
          <GridTeaser key={teaser._id} teaser={teaser} label={labels[index]} />
        ))}
      </div>
    </>
  )
}
