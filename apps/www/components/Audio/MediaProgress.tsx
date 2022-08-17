import { createContext, useContext, useMemo } from 'react'

import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

import { useMe } from '../../lib/context/MeContext'
import useUpsertMediaProgress from './hooks/useUpsertMediaProgress'
import useMediaProgressLazyQuery from './hooks/useMediaProgress'

type GetMediaProgress = ({
  mediaId,
  durationMs,
}: Partial<{
  mediaId: string
  durationMs: number
}>) => Promise<number | void>

type SaveMediaProgress = (
  { mediaId }: { mediaId: string },
  mediaElement: HTMLAudioElement,
) => void

type MediaProgressContextValue = {
  getMediaProgress: GetMediaProgress
  saveMediaProgress: SaveMediaProgress
}

const MediaProgressContext = createContext<MediaProgressContextValue>({
  getMediaProgress: () => Promise.reject('not implemented'),
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
  const [queryMediaProgress] = useMediaProgressLazyQuery()
  const [upsertMediaProgress] = useUpsertMediaProgress()

  const isTrackingAllowed = me && me.progressConsent === true

  const saveMediaProgressNotPlaying = useMemo(
    () =>
      debounce((mediaId, currentTime) => {
        console.log('saveMediaProgressNotPlaying', mediaId, currentTime)
        // Fires on pause, on scrub, on end of video.
        if (isTrackingAllowed) {
          upsertMediaProgress({ variables: { mediaId, secs: currentTime } })
        } else {
          setLocalMediaProgress({ mediaId, currentTime })
        }
      }, 300),
    [isTrackingAllowed, upsertMediaProgress, setLocalMediaProgress],
  )

  const saveMediaProgressWhilePlaying = useMemo(
    () =>
      throttle(
        (mediaId, currentTime) => {
          console.log('saveMediaProgressWhilePlaying', mediaId, currentTime)
          // Fires every 5 seconds while playing.
          if (isTrackingAllowed) {
            upsertMediaProgress({ variables: { mediaId, secs: currentTime } })
          } else {
            setLocalMediaProgress({ mediaId, currentTime })
          }
        },
        5000,
        { trailing: true },
      ),
    [isTrackingAllowed, upsertMediaProgress, setLocalMediaProgress],
  )

  const saveMediaProgress: SaveMediaProgress = ({ mediaId }, mediaElement) => {
    if (!mediaId) {
      return
    }
    // TODO: ensure that only of the two functions are called.
    saveMediaProgressNotPlaying(mediaId, mediaElement.currentTime)
    saveMediaProgressWhilePlaying(mediaId, mediaElement.currentTime)
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
