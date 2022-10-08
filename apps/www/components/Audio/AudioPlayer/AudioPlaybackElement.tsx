import { AudioPlayerProps } from '../AudioPlayerController'
import { useCallback, useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../../lib/matomo'
import { AUDIO_PLAYER_TRACK_CATEGORY } from '../constants'
import useInterval from '../../../lib/hooks/useInterval'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'

const DEFAULT_SYNC_INTERVAL = 500 // in ms

export type AudioElementState = {
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  playbackRate: number
  buffered: TimeRanges
}

type AudioPlaybackElementProps = Pick<
  AudioPlayerProps,
  'activeItem' | 'autoPlay' | 'playbackRate' | 'setWebHandlers'
> & {
  actions: Pick<
    AudioPlayerProps['actions'],
    'onEnded' | 'handleError' | 'syncWithMediaElement'
  >
}

const AudioPlaybackElement = ({
  activeItem,
  autoPlay,
  playbackRate,
  setWebHandlers,
  actions: { onEnded, handleError, syncWithMediaElement },
}: AudioPlaybackElementProps) => {
  const mediaRef = useRef<HTMLMediaElement>(null)
  const trackedPlayerItem = useRef<AudioQueueItem>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Pass on the state of the media-element to the UI
  const syncStateWithUI = useCallback(() => {
    const mediaElement = mediaRef.current

    if (!mediaElement) {
      return
    }

    const elem = {
      currentTime: mediaElement.currentTime,
      duration: mediaElement.duration,
      isPlaying: !mediaElement.paused,
      isLoading: isLoading && mediaElement.readyState < 3,
      playbackRate: mediaElement.playbackRate,
      buffered: mediaElement.buffered,
    }
    syncWithMediaElement(elem)
  }, [syncWithMediaElement])

  // Sync the state of the media-element with the UI while playing
  useInterval(syncStateWithUI, isPlaying ? DEFAULT_SYNC_INTERVAL : null)

  const onCanPlay = async () => {
    try {
      setIsLoading(false)
      syncStateWithUI()

      if (activeItem?.id !== trackedPlayerItem?.current?.id) {
        trackedPlayerItem.current = activeItem

        const { userProgress, durationMs } =
          activeItem.document?.meta.audioSource ?? {}
        const duration = durationMs / 1000

        if (mediaRef.current) {
          mediaRef.current.volume = 0.2
        }

        // Web
        // Only load the userProgress if given and smaller within 2 seconds of the duration
        if (
          mediaRef.current &&
          userProgress &&
          (!duration || userProgress.secs + 2 < duration)
        ) {
          mediaRef.current.currentTime = userProgress.secs
        }
      }

      if (!activeItem) return
      console.log('onCanPlay', {
        activeItem,
        // isPlaying,
        // shouldAutoPlay,
        // hasAutoPlayed,
      })
      // TODO: fix auto-play
      /**if (!isPlaying && shouldAutoPlay && !hasAutoPlayed) {
        setHasAutoPlayed(true)
        await onPlay()
      }*/
    } catch (error) {
      handleError(error)
    }
  }

  // Handle media-element errors
  const onError = useCallback(() => {
    if (mediaRef.current && mediaRef.current.error) {
      const error = mediaRef.current.error
      const errorObject = {
        message: error.message,
        code: error.code,
        MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
        MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
        MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
      }
      trackEvent([
        AUDIO_PLAYER_TRACK_CATEGORY,
        'webPlayer',
        'error',
        JSON.stringify(errorObject),
      ])
      handleError(new Error(JSON.stringify(errorObject, null, 2)))
    }
  }, [handleError])

  const onPlay = useCallback(async () => {
    const mediaElement = mediaRef.current
    if (!mediaElement) {
      return
    }

    mediaElement.playbackRate = playbackRate
    mediaElement.volume = 0.2
    await mediaElement.play()
    setIsPlaying(true)
    syncStateWithUI()
  }, [playbackRate])

  const onPause = useCallback(async () => {
    mediaRef.current?.pause()
    setIsPlaying(false)
    syncStateWithUI()
  }, [syncStateWithUI])

  const onStop = useCallback(async () => {
    mediaRef.current.pause()
    mediaRef.current.currentTime = 0
  }, [syncStateWithUI])

  const onSeekTo = useCallback(
    async (newPosition: number) => {
      mediaRef.current.currentTime = newPosition
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onForward = useCallback(
    async (forwardTime: number) => {
      mediaRef.current.currentTime += forwardTime
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onBackward = useCallback(
    async (backwardTime: number) => {
      mediaRef.current.currentTime -= backwardTime
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onPlaybackRateChange = useCallback(
    async (newPlaybackRate: number) => {
      mediaRef.current.playbackRate = newPlaybackRate
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  // Reset media-element if new source is provided
  useEffect(() => {
    if (activeItem?.id === trackedPlayerItem?.current?.id) {
      return
    }
    if (
      mediaRef.current &&
      // If no data could be retrieved so far, manually trigger load
      mediaRef.current.readyState === 0
    ) {
      setIsLoading(true)
      mediaRef.current.load()
      setIsLoading(false)
    }
  }, [activeItem, trackedPlayerItem, setIsLoading])

  // Sync handlers with the controller
  useEffect(() => {
    setWebHandlers({
      handlePlay: onPlay,
      handlePause: onPause,
      handleStop: onStop,
      handleSeekTo: onSeekTo,
      handleForward: onForward,
      handleBackward: onBackward,
      handlePlaybackRateChange: onPlaybackRateChange,
    })
  }, [
    onPlay,
    onPause,
    onStop,
    onSeekTo,
    onForward,
    onBackward,
    onPlaybackRateChange,
  ])

  const {
    document: { meta: { audioSource } = {} },
  } = activeItem

  return (
    <audio
      ref={mediaRef}
      preload={autoPlay ? 'auto' : 'metadata'}
      onPlay={onPlay}
      onPause={onPause}
      onCanPlay={onCanPlay}
      onEnded={onEnded}
      onError={onError}
    >
      {audioSource.mp3 && <source src={audioSource.mp3} type='audio/mp3' />}
      {audioSource.aac && <source src={audioSource.aac} type='audio/aac' />}
      {audioSource.ogg && <source src={audioSource.ogg} type='audio/ogg' />}
    </audio>
  )
}

export default AudioPlaybackElement
