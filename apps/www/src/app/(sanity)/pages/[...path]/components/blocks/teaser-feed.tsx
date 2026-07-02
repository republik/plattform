'use client'

import FeedTeaser, {
  FeedTeaserType,
} from '@/app/(sanity)/components/teaser/feed'
import { MAX_TEASERS } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-list'
import { useState } from 'react'

export function TeaserFeed({
  initialTeasers,
  total,
  maxItems,
  loadMoreAction,
}: {
  initialTeasers: FeedTeaserType[]
  total: number
  maxItems: number
  loadMoreAction: () => Promise<FeedTeaserType[]>
}) {
  const [teasers, setTeasers] = useState(initialTeasers)

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
    <div>
      {shownTeasers.map((teaser, index) => (
        <FeedTeaser
          key={teaser._id}
          teaser={teaser}
          index={index}
          skipHeading
        />
      ))}
      {showLoadMoreButton && (
        <button type='button' onClick={onLoadMore}>
          Das waren die neuesten {MAX_TEASERS} Beiträge. Weitere{' '}
          {total - shownTeasers.length} anschauen?
        </button>
      )}
    </div>
  )
}
