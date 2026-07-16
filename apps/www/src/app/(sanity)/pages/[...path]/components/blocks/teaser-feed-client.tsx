'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import React, { useState } from 'react'

export function TeaserFeedClient({
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

  console.log('shownTeasers', shownTeasers)

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
