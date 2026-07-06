'use client'

import FeedTeaser, {
  FeedTeaserType,
} from '@/app/(sanity)/components/teaser/feed'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import { useState } from 'react'

export function TeaserFeed({
  initialTeasers,
  total,
  maxItems,
  pageSize,
  loadMoreAction,
}: {
  initialTeasers: FeedTeaserType[]
  total: number
  maxItems: number
  pageSize: number
  loadMoreAction: () => Promise<FeedTeaserType[]>
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
    <div className={css({ mt: '20' })}>
      {shownTeasers.map((teaser, index) => (
        <FeedTeaser
          key={teaser._id}
          teaser={teaser}
          index={index}
          skipHeading
        />
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
