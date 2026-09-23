'use client'

import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { reportError } from '@/lib/errors/reportError'
import { useCallback, useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 20

/**
 * Fetched through a plain API route rather than a server action, for the
 * same reason as the queue's own hydration — see
 * `hooks/useAudioQueue.tsx`.
 */
async function fetchLatestAudioArticles(
  cursor?: AudioQueueItemContent,
): Promise<AudioQueueItemContent[]> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  // Keyset pagination: the last row of the previous page, matching the
  // `publishDate desc, _id asc` order the query sorts by.
  if (cursor?.publishDate) {
    params.set('lastPublishDate', cursor.publishDate)
    params.set('lastId', cursor._id)
  }

  const response = await fetch(`/api/sanity/latest-audio-articles?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch latest audio articles: ${response.status}`)
  }
  return response.json()
}

export type LatestAudioArticles = {
  articles: AudioQueueItemContent[]
  isLoading: boolean
  isLoadingMore: boolean
  hasError: boolean
  hasMore: boolean
  loadMore: () => void
}

/** The player's "Latest" tab: recently published articles that have audio. */
export function useLatestAudioArticles(): LatestAudioArticles {
  const [articles, setArticles] = useState<AudioQueueItemContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasError, setHasError] = useState(false)
  // A full page back means there may be another one; a short page is the end.
  const [hasMore, setHasMore] = useState(true)
  // Guards against a second in-flight request, whether from a double click on
  // "load more" or from the initial fetch racing it.
  const isFetching = useRef(false)

  const loadPage = useCallback((cursor?: AudioQueueItemContent) => {
    if (isFetching.current) return
    isFetching.current = true
    setHasError(false)
    if (cursor) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    fetchLatestAudioArticles(cursor)
      .then((page) => {
        setArticles((previous) => (cursor ? [...previous, ...page] : page))
        setHasMore(page.length === PAGE_SIZE)
      })
      .catch((error) => {
        setHasError(true)
        reportError('useLatestAudioArticles', error)
      })
      .finally(() => {
        isFetching.current = false
        setIsLoading(false)
        setIsLoadingMore(false)
      })
  }, [])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (!hasMore) return
    loadPage(articles[articles.length - 1])
  }, [articles, hasMore, loadPage])

  return { articles, isLoading, isLoadingMore, hasError, hasMore, loadMore }
}
