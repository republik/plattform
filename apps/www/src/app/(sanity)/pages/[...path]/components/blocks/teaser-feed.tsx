'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import React, { useState } from 'react'

export function TeaserFeed({
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

  // - we still have more teasers to load
  // - we haven't hit the user-defined cap
  const showLoadMoreButton =
    total > teasers.length && shownTeasers.length < (maxItems ?? Infinity)

  // TODO: alternative teaser style
  return (
    <div className={css({ mt: '16' })}>
      <h2 className={css({ textStyle: 'subtitleBold', mb: '8' })}>
        {title ||
          t.pluralize('feed/title', {
            count: total,
          })}
      </h2>
      <h2 className={css({ textStyle: 'subtitleBold' })}>{title}</h2>
      {shownTeasers.map((teaser) => (
        <FeedTeaser key={teaser._id} teaser={teaser} />
      ))}
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
    </div>
  )
}
