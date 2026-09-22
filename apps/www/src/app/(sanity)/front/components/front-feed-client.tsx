'use client'

import { TeaserItem } from '@/app/(sanity)/components/page-builder/teaser-item'
import { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

export function FrontFeedClient({
  initialTeasers,
  pageSize,
  loadMoreAction,
}: {
  initialTeasers: TeaserLargeFragmentType[]
  pageSize: number
  loadMoreAction: (offset: number) => Promise<TeaserLargeFragmentType[]>
}) {
  const [teasers, setTeasers] = useState(initialTeasers)
  const [hasMore, setHasMore] = useState(initialTeasers.length >= pageSize)
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
      {teasers.map((teaser, i) => (
        <TeaserItem key={i} reference={teaser} />
      ))}
      {hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
