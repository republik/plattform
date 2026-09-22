'use client'

import {
  type ContributorArticlesCursor,
  type ContributorArticlesPage,
  fetchContributorArticlesPage,
} from '@/app/(sanity)/components/contributor/articles-feed/contributor-articles-page'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { useEffect, useRef, useState } from 'react'

export function ArticlesByContributorFeedClient({
  userId,
}: {
  userId: string
}) {
  const [firstPage, setFirstPage] = useState<ContributorArticlesPage>()

  useEffect(() => {
    let cancelled = false

    fetchContributorArticlesPage(userId)
      .then((page) => {
        if (!cancelled) setFirstPage(page)
      })
      .catch((error) => console.error(error))

    return () => {
      cancelled = true
    }
  }, [userId])

  if (!firstPage?.teasers.length) return null

  return (
    <ArticlesByContributorFeedWithPages
      userId={userId}
      initialData={firstPage}
    />
  )
}

function ArticlesByContributorFeedWithPages({
  userId,
  initialData,
}: {
  userId: string
  initialData: ContributorArticlesPage
}) {
  const [page, setPage] = useState(initialData)
  const [teasers, setTeasers] = useState(initialData.teasers)
  const [nextCursor, setNextCursor] = useState<ContributorArticlesCursor>()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!nextCursor) return

    let cancelled = false

    fetchContributorArticlesPage(userId, nextCursor)
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
  }, [userId, nextCursor])

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

  return (
    <div>
      {teasers.map((teaser) => (
        <FeedTeaser key={teaser._id} teaser={teaser} />
      ))}
      {page.hasMore && <div ref={sentinelRef} aria-hidden />}
    </div>
  )
}
