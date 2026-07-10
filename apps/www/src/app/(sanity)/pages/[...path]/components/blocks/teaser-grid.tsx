'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { SanitySquareCover } from '@/app/components/assets/SquareCover'
import { css } from '@republik/theme/css'
import React from 'react'

const gridStyle = css({
  gridColumn: 'breakout',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  columnGap: '4',
  rowGap: '12',
})

const tileStyle = css({
  position: 'relative',

  // title (serifTitle16, mUp serifTitle20)
  '& h4': {
    fontFamily: 'republikSerif',
    fontWeight: 'black',
    fontSize: 'l',
    md: { fontSize: 'xl' },
    lineHeight: 1.1,
    marginBlock: '0.8em',
  },
  // lead (serifRegular15, mUp serifRegular17)
  '& p.description': {
    fontFamily: 'rubis',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.5,
    marginBottom: 2,
  },
})

function GridTeaser({ teaser }: { teaser: TeaserFragmentType }) {
  return (
    <div className={tileStyle}>
      <Heading teaser={teaser} />
      <SanitySquareCover size='100%' />
      <h4>
        <LinkOverlay teaser={teaser} />
      </h4>
      {teaser.description && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
    </div>
  )
}

export async function TeaserGrid({
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
