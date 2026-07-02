'use client'

import FeedTeaser, {
  FeedTeaserType,
} from '@/app/(sanity)/components/teaser/feed'
import { useState } from 'react'

export function TeaserFeed({
  initialTeasers,
  hasMore,
  maxItems,
  loadMoreAction,
}: {
  initialTeasers: FeedTeaserType[]
  hasMore: boolean
  maxItems: number
  loadMoreAction: () => Promise<FeedTeaserType[]>
}) {
  const [teasers, setTeasers] = useState(initialTeasers)

  async function onLoadMore() {
    const more = await loadMoreAction()
    setTeasers((prev) => prev.concat(more))
  }

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)
  const showLoadMoreButton =
    hasMore && shownTeasers.length < (maxItems ?? Infinity)

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
          'Alle anzeigen'
        </button>
      )}
    </div>
  )
}
