'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

export function ArticlesFeedClient({
  initialTeasers,
  initialSize,
  pageSize,
  loadMoreAction,
}: {
  initialTeasers: TeaserSmallFragmentType[]
  initialSize: number
  pageSize: number
  loadMoreAction: (offset: number) => Promise<TeaserSmallFragmentType[]>
}) {
  const [teasers, setTeasers] = useState(initialTeasers)
  // if the initial page came back short there is nothing more to load
  const [hasMore, setHasMore] = useState(initialTeasers.length >= initialSize)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    startTransition(async () => {
      const more = await loadMoreAction(teasers.length)
      setTeasers((prev) => prev.concat(more))
      if (more.length < pageSize) setHasMore(false)
    })
  }, [loadMoreAction, teasers.length, pageSize])

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
      {teasers.map((teaser) => (
        <FeedTeaser key={teaser._id} teaser={teaser} skipPublishDate />
      ))}
      {hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
