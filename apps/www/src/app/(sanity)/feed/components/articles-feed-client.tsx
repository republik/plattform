'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { DateGroup } from '@/app/components/date-group/date-group'
import { groupByDate } from '@/app/components/date-group/group-by-date'
import { stegaClean } from 'next-sanity'
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

  const groups = groupByDate(teasers, (teaser) =>
    stegaClean(teaser.publishDate),
  )

  return (
    <>
      {groups.map((group) => (
        <DateGroup key={group.key} label={group.label} labelLg={group.labelLg}>
          {group.items.map((teaser) => (
            <FeedTeaser key={teaser._id} teaser={teaser} skipPublishDate />
          ))}
        </DateGroup>
      ))}
      {page.hasMore && <div ref={sentinelRef} aria-hidden />}
    </>
  )
}
