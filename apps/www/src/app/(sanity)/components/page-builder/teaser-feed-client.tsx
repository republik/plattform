'use client'

import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import React, { useEffect, useRef, useState } from 'react'

export type TeaserFeedPage = {
  teasers: TeaserListItemType[]
  hasMore: boolean
  cursor?: number
}

export function TeaserFeedClient({
  initialPage,
  teaserList,
  loadMoreAction,
}: {
  initialPage: TeaserFeedPage
  teaserList: TeaserListBlockFragmentType
  loadMoreAction: (cursor?: number) => Promise<TeaserFeedPage>
}) {
  const { total, title, maxItems } = teaserList

  const [page, setPage] = useState(initialPage)
  const [teasers, setTeasers] = useState(initialPage.teasers)
  const [nextCursor, setNextCursor] = useState<number>()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (nextCursor === undefined) return

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

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)

  // - we still have more teasers to load
  // - we haven't hit the user-defined cap
  const hasMore =
    page.hasMore && shownTeasers.length < (maxItems ?? Infinity)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const cursor = page.cursor
    if (!sentinel || !hasMore || cursor === undefined) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNextCursor(cursor)
      },
      { rootMargin: '600px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, page.cursor])

  return (
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
      {hasMore && <div ref={sentinelRef} aria-hidden />}
    </div>
  )
}
