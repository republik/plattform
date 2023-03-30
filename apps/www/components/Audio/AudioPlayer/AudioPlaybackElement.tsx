import { AudioPlayerProps } from '../AudioPlayerController'
import { useCallback, useEffect, useRef, useState } from 'react'
import useInterval from '../../../lib/hooks/useInterval'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'
import { useMediaSession } from '../hooks/useMediaSession'

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
  | 'activeItem'
  | 'autoPlay'
  | 'currentTime'
  | 'playbackRate'
  | 'setWebHandlers'
  | 'setHasAutoPlayed'
> & {
  actions: Pick<
    AudioPlayerProps['actions'],
    | 'onEnded'
    | 'handleError'
    | 'syncWithMediaElement'
    | 'onSkipToNext'
    | 'onClose'
  >
}

const AudioPlaybackElement = ({
  activeItem,
  autoPlay,
  currentTime,
  playbackRate,
  setWebHandlers,
  setHasAutoPlayed,
  actions: {
    onEnded,
    handleError,
    syncWithMediaElement,
    onSkipToNext,
    onClose,
  },
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
      if (!activeItem) return

      setIsLoading(false)
      syncStateWithUI()
      let activeItemHasChanged = false
      if (activeItem?.id !== trackedPlayerItem?.current?.id) {
        trackedPlayerItem.current = activeItem
        activeItemHasChanged = true

        if (mediaRef.current) {
          mediaRef.current.playbackRate = playbackRate
        }

        mediaRef.current.currentTime = currentTime
      }

      // Don't call on play if already playing, unless the activeItem has changed
      if ((activeItemHasChanged || !isPlaying) && autoPlay) {
        setHasAutoPlayed()
        await onPlay()
      }
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
      handleError(new Error(JSON.stringify(errorObject, null, 2)))
    }
  }, [handleError])

  // Either resume playing the track or if a position is given start playing from there
  const onPlay = useCallback(
    async (startAtPosition?: number) => {
      const mediaElement = mediaRef.current
      if (!mediaElement) {
        return
      }
      if (startAtPosition) {
        mediaElement.currentTime = startAtPosition
      }

      mediaElement.playbackRate = playbackRate
      await mediaElement
        .play()
        .catch((error) => console.error('playback error', error))
      setIsPlaying(true)
      syncStateWithUI()
    },
    [syncStateWithUI, playbackRate],
  )

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

  const onSetPosition = useCallback(
    async (newPosition: number) => {
      mediaRef.current.currentTime = newPosition
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  // Reset media-element if new source is provided
  useEffect(() => {
    if (activeItem?.id === trackedPlayerItem?.current?.id) {
      return
    }

    if (mediaRef.current) {
      setIsLoading(true)
      mediaRef.current.load()
      mediaRef.current.playbackRate = playbackRate
      setIsLoading(false)
    }
  }, [activeItem, trackedPlayerItem, setIsLoading, playbackRate])

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
      handleSetPosition: onSetPosition,
    })
  }, [
    onPlay,
    onPause,
    onStop,
    onSeekTo,
    onForward,
    onBackward,
    onPlaybackRateChange,
    onSetPosition,
  ])

  // Once the component is unmounted, ensure the handlers are set to null.
  useEffect(() => {
    return () => setWebHandlers(null)
  }, [])

  useMediaSession(activeItem, {
    isPlaying,
    callbacks: {
      onPlay,
      onPause,
      onSeekForward: (seekOffset: number) => onForward(seekOffset),
      onSeekBackward: (seekOffset: number) => onBackward(seekOffset),
      onSkipToNext: () => onSkipToNext(),
      onStop: () => onClose(),
      onRetrievePlayerState: () => ({
        currentTime: mediaRef.current?.currentTime ?? 0,
        duration: mediaRef.current?.duration ?? 0,
        playbackRate: mediaRef.current?.playbackRate ?? 1,
      }),
    },
  })

  const {
    document: { meta: { audioSource } = {} },
  } = activeItem

  return (
    <audio
      ref={mediaRef}
      preload={autoPlay ? 'auto' : 'metadata'}
      onPlay={() => onPlay}
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
