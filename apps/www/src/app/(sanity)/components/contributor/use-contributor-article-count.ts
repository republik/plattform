'use client'

import { ARTICLES_BY_AUTHOR_COUNT_QUERY } from '@/app/(sanity)/groq/articles-by-author-query'
import { client } from '@/app/(sanity)/lib/client'
import { useEffect, useState } from 'react'

export function useContributorArticleCount(userId: string) {
  const [count, setCount] = useState<number>()

  useEffect(() => {
    let cancelled = false

    client
      .fetch<number | null>(ARTICLES_BY_AUTHOR_COUNT_QUERY, { userId })
      .then((result) => {
        if (!cancelled) setCount(result ?? 0)
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setCount(0)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { count: count ?? 0, loading: count === undefined }
}
