import { gql, useQuery } from '@apollo/client'
import { useEffect } from 'react'

const miniNaviQuery = gql`
  query miniNavi {
    documents(format: "republik/format-journal", first: 1) {
      nodes {
        id
        meta {
          title
          path
          publishDate
        }
      }
    }
  }
`

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
const PUBLISH_HOURS = 5
const PUBLISH_MINUTES = 0

let lastFetchDate
const runOnceIfOutdated = (callback) => {
  const now = new Date()
  if (!lastFetchDate) {
    lastFetchDate = now
  }
  const publishTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    PUBLISH_HOURS,
    PUBLISH_MINUTES,
  )
  if (
    (lastFetchDate < publishTime && now > publishTime) ||
    now - lastFetchDate > ONE_DAY_IN_MS
  ) {
    lastFetchDate = now
    callback()
  }
}

export const useFlyerMeta = () => {
  const { data, refetch } = useQuery(miniNaviQuery)

  useEffect(() => {
    // immediately refetch if necessary
    runOnceIfOutdated(refetch)

    const now = new Date()
    const publishTimeToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      PUBLISH_HOURS,
      PUBLISH_MINUTES,
    )
    const publishTimeTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      PUBLISH_HOURS,
      PUBLISH_MINUTES,
    )
    const nextUpdateMs =
      now < publishTimeToday
        ? publishTimeToday - now
        : publishTimeTomorrow - now
    let refetchTimeoutId
    const refreshAtPublishTime = () => {
      runOnceIfOutdated(refetch)
      // recursion 24h later again
      refetchTimeoutId = setTimeout(() => {
        refreshAtPublishTime()
      }, ONE_DAY_IN_MS)
    }
    refetchTimeoutId = setTimeout(refreshAtPublishTime, nextUpdateMs)
    return () => {
      clearTimeout(refetchTimeoutId)
    }
  }, [])

  return data?.documents.nodes[0]?.meta
}
