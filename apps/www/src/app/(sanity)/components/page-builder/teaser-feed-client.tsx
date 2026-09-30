'use client'

import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import React, { useState, useTransition } from 'react'

export function TeaserFeedClient({
  initialTeasers,
  teaserList,
  pageSize,
  loadMoreAction,
}: {
  initialTeasers: TeaserListItemType[]
  teaserList: TeaserListBlockFragmentType
  pageSize: number
  loadMoreAction: (offset: number) => Promise<TeaserListItemType[]>
}) {
  const { total, title, maxItems } = teaserList

  const [teasers, setTeasers] = useState(initialTeasers)
  // position in the source list; can be ahead of teasers.length because
  // expired teasers are filtered out after fetching
  const [offset, setOffset] = useState(pageSize)
  const [isPending, startTransition] = useTransition()
  const { t } = useTranslation()

  function onLoadMore() {
    startTransition(async () => {
      const more = await loadMoreAction(offset)
      setTeasers((prev) => prev.concat(more))
      setOffset((prev) => prev + pageSize)
    })
  }

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)

  // - we still have more teasers to load
  // - we haven't hit the user-defined cap
  const showLoadMoreButton =
    total > offset && shownTeasers.length < (maxItems ?? Infinity)

  return (
    <>
      <div>
        <h2 className={css({ textStyle: 'subtitleBold', mb: '8', mt: '16' })}>
          {title ||
            t.pluralize('feed/title', {
              count: total,
            })}
        </h2>

        {shownTeasers.map((teaser) => (
          <FeedTeaser key={teaser._id} teaser={teaser} />
        ))}
      </div>

      {showLoadMoreButton && (
        <Button
          type='button'
          variant='link'
          className={css({
            color: 'primary',
            textDecoration: 'none',
            textAlign: 'left',
          })}
          onClick={onLoadMore}
          disabled={isPending}
        >
          {t('feed/loadMore', {
            count: shownTeasers.length,
            remaining: total - offset,
          })}
        </Button>
      )}
    </>
  )
}
