import { AudioPlayerProps } from '../AudioPlayerController'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import useInterval from '../../../lib/hooks/useInterval'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'
import { useMediaSession } from '../hooks/useMediaSession'

const DEFAULT_SYNC_INTERVAL = 500 // in ms

/**
 * Programmatically set the audio sources of an audio element based on the audioSource object
 * @param elem html audio-element for which the sources should be set
 * @param audioSource object containing the audio sources
 */
function setAudioSources(
  elem: HTMLAudioElement,
  audioSource: AudioQueueItem['document']['meta']['audioSource'],
) {
  const sources = {
    'audio/mp3': audioSource.mp3,
    'audio/ogg': audioSource.ogg,
    'audio/aac': audioSource.aac,
  }

  const sourceElements = Object.keys(sources)
    .map((type) => {
      if (sources[type] === null) {
        return null
      }
      const source = document.createElement('source')
      source.type = type
      source.src = sources[type]
      return source
    })
    .filter(Boolean)

  console.log('Audio Elem: setAudioSources', {
    elem,
    audioSource,
    sources,
    sourceElements,
  })

  elem.innerHTML = '' // Hack to remove all previous sources
  elem.append(...sourceElements)
}

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
  'playbackRate' | 'setWebHandlers'
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
  playbackRate,
  setWebHandlers,
  actions: {
    onEnded,
    handleError,
    syncWithMediaElement,
    onSkipToNext,
    onClose,
  },
}: AudioPlaybackElementProps) => {
  const audioElementId = useId()
  const mediaRef = useRef<HTMLMediaElement>(null)
  const trackedPlayerItem = useRef<AudioQueueItem>(null)
  const [activePlayerItem, setActivePlayerItem] =
    useState<AudioQueueItem | null>(null)
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

      console.log('Audio Elem: onPlay', {
        startAtPosition,
        playbackRate,
        elem: mediaElement,
      })

      if (startAtPosition) {
        mediaElement.currentTime = startAtPosition
      }

      mediaElement.playbackRate = playbackRate
      await mediaElement
        .play()
        .catch((error) => console.error('Audio Elem: playback error', error))
      setIsPlaying(true)
      syncStateWithUI()
    },
    [syncStateWithUI, playbackRate],
  )

  // Setup a new player-item and load it into the media-element
  const onSetupActivePlayerItem = useCallback(
    async (playerItem: AudioQueueItem, autoPlay: boolean, initialTime = 0) => {
      console.log('Audio Elem: onSetupActivePlayerItem', {
        playerItem,
        autoPlay,
        initialTime,
      })
      if (!mediaRef.current) {
        console.error(
          'Audio Elem: onSetupActivePlayerItem: no mediaRef.current',
        )
        return
      }

      setActivePlayerItem(playerItem)
      setAudioSources(mediaRef.current, playerItem.document.meta.audioSource)
      mediaRef.current.preload = autoPlay ? 'auto' : 'metadata'

      setIsLoading(true)
      mediaRef.current.load()
      mediaRef.current.playbackRate = playbackRate
      mediaRef.current.currentTime = initialTime

      setIsLoading(false)

      if (autoPlay) {
        await onPlay(initialTime)
      }
    },
    [onPlay],
  )

  const onPause = useCallback(async () => {
    console.log('Audio Elem: onPause')
    mediaRef.current?.pause()
    setIsPlaying(false)
    syncStateWithUI()
  }, [syncStateWithUI])

  const onStop = useCallback(async () => {
    console.log('Audio Elem: onStop')
    mediaRef.current.pause()
    mediaRef.current.currentTime = 0
  }, [syncStateWithUI])

  const onSeekTo = useCallback(
    async (newPosition: number) => {
      console.log('Audio Elem: onSeekTo', { newPosition })
      mediaRef.current.currentTime = newPosition
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onForward = useCallback(
    async (forwardTime: number) => {
      console.log('Audio Elem: onForward', { forwardTime })
      mediaRef.current.currentTime += forwardTime
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onBackward = useCallback(
    async (backwardTime: number) => {
      console.log('Audio Elem: onBackward', { backwardTime })
      mediaRef.current.currentTime -= backwardTime
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onPlaybackRateChange = useCallback(
    async (newPlaybackRate: number) => {
      console.log('Audio Elem: onPlaybackRateChange', { newPlaybackRate })
      mediaRef.current.playbackRate = newPlaybackRate
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  const onSetPosition = useCallback(
    async (newPosition: number) => {
      console.log('Audio Elem: onSetPosition', { newPosition })
      mediaRef.current.currentTime = newPosition
      syncStateWithUI()
    },
    [syncStateWithUI],
  )

  // Sync handlers with the controller
  useEffect(() => {
    setWebHandlers({
      handleSetupTrack: onSetupActivePlayerItem,
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
    onSetupActivePlayerItem,
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

  useMediaSession(activePlayerItem, {
    isPlaying,
    callbacks: {
      onPlay,
      onPause,
      onSeekForward: (seekOffset: number) => onForward(seekOffset),
      onSeekBackward: (seekOffset: number) => onBackward(seekOffset),
      onSkipToNext: () => onSkipToNext(),
      onStop: () => onClose,
      onRetrievePlayerState: () => ({
        currentTime: mediaRef.current?.currentTime ?? 0,
        duration: mediaRef.current?.duration ?? 0,
        playbackRate: mediaRef.current?.playbackRate ?? 1,
      }),
    },
  })

  trackedPlayerItem.current = activePlayerItem

  return (
    <audio
      data-audioplayer-element
      id={audioElementId}
      ref={mediaRef}
      onPlay={() => onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onError={onError}
    />
  )
}

export default AudioPlaybackElement
