/**
 * Client-side React hooks to fetch Sanity data exposed by our API routes
 */

import { useEffect, useState } from 'react'

function createHook<T extends { _id: string }>(route: string) {
  return function (ids: string[]): Record<string, T> {
    const [data, setData] = useState<Record<string, T>>({})
    const params = JSON.stringify({ ids })

    const fetchData = async (params: string) => {
      const response = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: params,
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch Sanity items: ${response.status}`)
      }
      return response.json()
    }

    useEffect(() => {
      let cancelled = false
      fetchData(params)
        .then((result) => {
          if (cancelled) {
            return
          }
          setData(Object.fromEntries(result.map((d: T) => [d._id, d])))
        })
        .catch((err) => {
          console.error(err)
        })
      return () => {
        cancelled = true
      }
    }, [params])

    return data
  }
}

export const useSanityArticles = createHook('/api/sanity/articles')
export const useSanityCollections = createHook('/api/sanity/collections')
