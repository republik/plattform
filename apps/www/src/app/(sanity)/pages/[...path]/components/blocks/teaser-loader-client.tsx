'use client'

import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TeaserFeed } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-feed'
import { TeaserGrid } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-grid'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import React, { useState } from 'react'

export function TeaserLoaderClient({
  initialTeasers,
  teaserList,
  pageSize,
  loadMoreAction,
}: {
  initialTeasers: TeaserFragmentType[]
  teaserList: TeaserListBlockFragmentType
  pageSize: number
  loadMoreAction: () => Promise<TeaserFragmentType[]>
}) {
  const { total, title, maxItems } = teaserList
  const appearance = stegaClean(teaserList.appearance)

  const [teasers, setTeasers] = useState(initialTeasers)
  const { t } = useTranslation()

  async function onLoadMore() {
    const more = await loadMoreAction()
    setTeasers((prev) => prev.concat(more))
  }

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)

  // - we still have more teasers to load
  // - we haven't hit the user-defined cap
  const showLoadMoreButton =
    total > teasers.length && shownTeasers.length < (maxItems ?? Infinity)

  return (
    <>
      {appearance === 'GRID' ? (
        <TeaserGrid teasers={teasers} title={title} />
      ) : (
        <TeaserFeed total={total} teasers={shownTeasers} title={title} />
      )}

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
