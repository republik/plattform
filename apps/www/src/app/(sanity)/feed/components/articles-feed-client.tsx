'use client'

import { groupByDate } from '@/app/(sanity)/feed/components/group-by-date'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { css, cx } from '@republik/theme/css'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

const groupStyle = css({
  display: 'grid',
  gridTemplateColumns: { base: '1fr', lg: '120px 1fr' },
  columnGap: '8',
  alignItems: 'start',
})

const dateHeaderStyle = css({
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  py: '4',
  whiteSpace: 'pre-line',
  textStyle: 'sans',
  fontSize: 's',
  position: 'sticky',
  top: '0',
  alignSelf: 'start',
  background: 'pageBackground',
  zIndex: 1,
  lg: { pb: '6' },
})

const teaserGroupStyle = css({
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  pt: '6',
})

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

  const groups = groupByDate(teasers)

  return (
    <>
      {groups.map((group) => (
        <section key={group.key} className={groupStyle}>
          <h2
            className={cx(
              dateHeaderStyle,
              css({ display: 'block', lg: { display: 'none' } }),
            )}
          >
            {group.label}
          </h2>
          <h2
            className={cx(
              dateHeaderStyle,
              css({ display: 'none', lg: { display: 'block' } }),
            )}
          >
            {group.labelLg}
          </h2>
          <div className={teaserGroupStyle}>
            {group.teasers.map((teaser) => (
              <FeedTeaser key={teaser._id} teaser={teaser} skipPublishDate />
            ))}
          </div>
        </section>
      ))}
      {hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
