import { gql, useApolloClient } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'

import { useMe } from '@/lib/context/MeContext'
import { reportError } from '@/lib/errors/reportError'
import { AudioQueueItemProgress } from '../types/AudioQueueItem'

const MEDIA_PROGRESS_BY_IDS_QUERY = gql`
  query mediaProgressByIds($mediaIds: [ID!]!) {
    mediaProgressByIds(mediaIds: $mediaIds) {
      id
      secs
    }
  }
`

type ProgressByMediaId = Record<string, AudioQueueItemProgress>

/**
 * Playback progress for a growing list of articles, keyed by `mediaId`.
 * Only ids not asked about yet are requested, so each page the list loads
 * costs one request and earlier rows are never re-sent. Empty for readers
 * who are signed out or have not consented to progress tracking.
 */
export function useMediaProgressByIds(mediaIds: string[]): ProgressByMediaId {
  const client = useApolloClient()
  const { me, progressConsent } = useMe()
  const [progress, setProgress] = useState<ProgressByMediaId>({})
  const requested = useRef(new Set<string>())

  const enabled = !!me && !!progressConsent

  useEffect(() => {
    if (!enabled) return
    const missing = mediaIds.filter((id) => !requested.current.has(id))
    if (!missing.length) return
    missing.forEach((id) => requested.current.add(id))

    client
      .query<{ mediaProgressByIds: (AudioQueueItemProgress | null)[] }>({
        query: MEDIA_PROGRESS_BY_IDS_QUERY,
        variables: { mediaIds: missing },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        // One entry per id, in input order.
        const found = missing.flatMap((id, i) => {
          const entry = data.mediaProgressByIds[i]
          return entry ? [[id, entry] as const] : []
        })
        setProgress((previous) => ({
          ...previous,
          ...Object.fromEntries(found),
        }))
      })
      .catch((error) => {
        // Forget these ids so a later change to the list can ask again.
        missing.forEach((id) => requested.current.delete(id))
        reportError('useMediaProgressByIds', error)
      })
  }, [client, enabled, mediaIds])

  return enabled ? progress : {}
}
