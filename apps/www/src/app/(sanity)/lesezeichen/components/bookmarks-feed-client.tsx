'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import type { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

export type TeaserFeedData = {
  teasers: TeaserSmallFragmentType[]
  hasMore: boolean
  after?: string
}

export function BookmarksFeedClient({
  initialData,
  loadMoreAction,
}: {
  initialData: TeaserFeedData

  loadMoreAction: (after?: string) => Promise<TeaserFeedData>
}) {
  const [teasers, setTeasers] = useState(initialData.teasers)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [after, setAfter] = useState(initialData.after)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    startTransition(async () => {
      const more = await loadMoreAction(after)
      setTeasers((prev) => prev.concat(more.teasers))
      setHasMore(more.hasMore)
      setAfter(more.after)
    })
  }, [loadMoreAction, hasMore, after])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPending) loadMore()
      },
      { rootMargin: '600px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isPending, loadMore])

  return (
    <>
      {teasers.map((teaser, i) => (
        <FeedTeaser key={teaser._id} teaser={teaser} />
      ))}
      {hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
