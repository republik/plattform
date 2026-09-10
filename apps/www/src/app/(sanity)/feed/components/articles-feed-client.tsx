'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { groupByDate } from '@/app/(sanity)/feed/components/group-by-date'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { css, cx } from '@republik/theme/css'
import { useEffect, useRef, useState } from 'react'

export type FeedCursor = {
  publishDate: string
  id: string
}

export type FeedPage = {
  teasers: TeaserSmallFragmentType[]
  hasMore: boolean
  cursor?: FeedCursor
}

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
  initialPage,
  loadMoreAction,
}: {
  initialPage: FeedPage
  loadMoreAction: (cursor?: FeedCursor) => Promise<FeedPage>
}) {
  const [page, setPage] = useState(initialPage)
  const [teasers, setTeasers] = useState(initialPage.teasers)
  const [nextCursor, setNextCursor] = useState<FeedCursor>()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!nextCursor) return

    let cancelled = false

    loadMoreAction(nextCursor)
      .then((next) => {
        if (cancelled) return
        setTeasers((prev) => prev.concat(next.teasers))
        setPage(next)
        setNextCursor(undefined)
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setNextCursor(undefined)
      })

    return () => {
      cancelled = true
    }
  }, [loadMoreAction, nextCursor])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const cursor = page.cursor
    if (!sentinel || !page.hasMore || !cursor) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNextCursor(cursor)
      },
      { rootMargin: '600px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [page.hasMore, page.cursor])

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
      {page.hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
