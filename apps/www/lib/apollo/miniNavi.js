import { gql, useQuery } from '@apollo/client'
import { useEffect } from 'react'

export const miniNaviQuery = gql`
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

let refetchTimeoutId

const PUBLISH_HOURS = 5
const PUBLISH_MINUTES = 0

export const useFlyerMeta = () => {
  const { data, refetch } = useQuery(miniNaviQuery)

  useEffect(() => {
    if (refetchTimeoutId !== undefined) {
      return
    }
    const now = new Date()
    const updateTimeToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      PUBLISH_HOURS,
      PUBLISH_MINUTES,
    )
    const nextUpdateTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      PUBLISH_HOURS,
      PUBLISH_MINUTES,
    )
    const nextUpdateMs =
      now < updateTimeToday ? updateTimeToday - now : nextUpdateTomorrow - now
    const refresh = () => {
      refetch()
      // recursion 24h later again
      refetchTimeoutId = setTimeout(() => {
        refresh()
      }, 24 * 60 * 60 * 1000)
    }
    refetchTimeoutId = setTimeout(refresh, nextUpdateMs)
  }, [])

  return data?.documents.nodes[0]?.meta
}
