import { createContext, useContext, useMemo } from 'react'

import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

import { useMe } from '../../lib/context/MeContext'
import useUpsertMediaProgress from './hooks/useUpsertMediaProgress'
import { useMediaProgressLazyQuery } from './hooks/useMediaProgressQuery'

type GetMediaProgress = ({
  mediaId,
  durationMs,
}: Partial<{
  mediaId: string
  durationMs: number
}>) => Promise<number | void>

type SaveMediaProgress = (
  mediaId: string,
  currentTime: number,
  isPlaying?: boolean,
) => Promise<unknown>

type MediaProgressContextValue = {
  getMediaProgress: GetMediaProgress
  saveMediaProgress: SaveMediaProgress
}

const MediaProgressContext = createContext<MediaProgressContextValue>({
  getMediaProgress: () => {
    throw new Error('not implemented')
  },
  saveMediaProgress: () => {
    throw new Error('not implemented')
  },
})

export const useMediaProgress = () => useContext(MediaProgressContext)

const localStorageKey = 'republik-progress-media'

let fallbackStore
const getLocalMediaProgress = () => {
  let value = fallbackStore
  try {
    value = JSON.parse(window.localStorage.getItem(localStorageKey))
  } catch (e) {}
  return value
}
const setLocalMediaProgress = async (data) => {
  fallbackStore = data
  try {
    window.localStorage.setItem(localStorageKey, JSON.stringify(data))
  } catch (e) {}
}

const MediaProgressProvider = ({ children }) => {
  const { me } = useMe()
  const [queryMediaProgress] = useMediaProgressLazyQuery({
    fetchPolicy: 'network-only',
    ssr: false,
  })
  const [upsertMediaProgress] = useUpsertMediaProgress()

  const isTrackingAllowed = me?.progressOptOut === null || me?.progressOptOut === false

  const saveMediaProgressNotPlaying = useMemo(
    () =>
      debounce((mediaId, currentTime) => {
        // Fires on pause, on scrub, on end of video.
        if (isTrackingAllowed) {
          return upsertMediaProgress({
            variables: { mediaId, secs: currentTime },
          })
        } else {
          return setLocalMediaProgress({ mediaId, currentTime })
        }
      }, 300),
    [isTrackingAllowed, upsertMediaProgress, setLocalMediaProgress],
  )

  const saveMediaProgressWhilePlaying = useMemo(
    () =>
      throttle(
        (mediaId, currentTime) => {
          // Fires every 5 seconds while playing.
          if (isTrackingAllowed) {
            return upsertMediaProgress({
              variables: { mediaId, secs: currentTime },
            })
          } else {
            return setLocalMediaProgress({ mediaId, currentTime })
          }
        },
        5000,
        { trailing: true },
      ),
    [isTrackingAllowed, upsertMediaProgress, setLocalMediaProgress],
  )

  const saveMediaProgress: SaveMediaProgress = (
    mediaId: string,
    currentTime: number,
    isPlaying?: boolean,
  ): Promise<unknown> => {
    if (!mediaId) {
      return Promise.resolve()
    }
    if (isPlaying) {
      return saveMediaProgressWhilePlaying(mediaId, currentTime)
    } else {
      return saveMediaProgressNotPlaying(mediaId, currentTime)
    }
  }

  const getMediaProgress: GetMediaProgress = ({ mediaId, durationMs } = {}) => {
    if (!mediaId) {
      return Promise.resolve()
    }
    if (isTrackingAllowed) {
      return (
        queryMediaProgress({
          variables: { mediaId },
        })
          .then(({ data: { mediaProgress } }) => {
            // mediaProgress can be null
            const { secs } = mediaProgress || {}
            if (secs) {
              if (
                durationMs &&
                Math.round(secs) === Math.round(durationMs / 1000)
              ) {
                return
              }
              return secs - 2
            }
          })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {})
      ) // silently fail media progress upsert
    } else {
      const localMediaProgress = getLocalMediaProgress()
      if (localMediaProgress?.mediaId === mediaId) {
        return Promise.resolve(localMediaProgress.currentTime - 2)
      }
    }
    return Promise.resolve()
  }

  return (
    <MediaProgressContext.Provider
      value={{
        getMediaProgress,
        saveMediaProgress,
      }}
    >
      {children}
    </MediaProgressContext.Provider>
  )
}

export default MediaProgressProvider
