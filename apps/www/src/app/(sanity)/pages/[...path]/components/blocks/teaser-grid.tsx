'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { SanitySquareCover } from '@/app/components/assets/SquareCover'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import React, { useState } from 'react'

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
  initialTeasers,
  total,
  maxItems,
  pageSize,
  loadMoreAction,
  title,
}: {
  initialTeasers: TeaserFragmentType[]
  total: number
  maxItems?: number
  pageSize: number
  loadMoreAction: () => Promise<TeaserFragmentType[]>
  title?: string
}) {
  const [teasers, setTeasers] = useState(initialTeasers)
  const { t } = useTranslation()

  async function onLoadMore() {
    const more = await loadMoreAction()
    setTeasers((prev) => prev.concat(more))
  }

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)

  const showLoadMoreButton =
    total > teasers.length && shownTeasers.length < (maxItems ?? Infinity)

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
      {showLoadMoreButton && (
        <Button
          type='button'
          variant='link'
          className={css({ color: 'primary', textDecoration: 'none' })}
          onClick={onLoadMore}
        >
          {t('feed/loadMore', {
            count: pageSize,
            remaining: total - shownTeasers.length,
          })}
        </Button>
      )}
    </>
  )
}
