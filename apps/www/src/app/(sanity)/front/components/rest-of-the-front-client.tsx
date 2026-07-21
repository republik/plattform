'use client'

import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import GridTeaser from '@/app/(sanity)/components/teaser/grid'
import { css } from '@republik/theme/css'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

const gridStyle = css({
  gridColumn: 'breakout',
  display: 'grid',
  gridTemplateColumns: '1fr',
  md: { gridTemplateColumns: 'repeat(2, 1fr)' },
  lg: { gridTemplateColumns: 'repeat(3, 1fr)' },
  columnGap: '4',
  rowGap: '12',
})

export function RestOfTheFrontClient({
  initialTeasers,
  pageSize,
  loadMoreAction,
}: {
  initialTeasers: TeaserListItemType[]
  pageSize: number
  // returns the next page given the current offset
  loadMoreAction: (offset: number) => Promise<TeaserListItemType[]>
}) {
  const [teasers, setTeasers] = useState(initialTeasers)
  // if the first page came back short, there is nothing more to load
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
      { rootMargin: '600px' }, // start loading before the user reaches the end
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isPending, loadMore])

  return (
    <>
      <div className={gridStyle}>
        {teasers.map((teaser) => (
          <GridTeaser key={teaser._id} teaser={teaser} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
