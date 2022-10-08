import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { useAudioContext, useAudioContextEvent } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent, AudioEventHandlers } from './types/AudioEvent'
import notifyApp from '../../lib/react-native/NotifyApp'
import useAudioQueue from './hooks/useAudioQueue'
import { AudioQueueItem } from './graphql/AudioQueueHooks'
import useNativeAppEvent from '../../lib/react-native/useNativeAppEvent'
import { useMediaProgress } from './MediaProgress'
import useInterval from '../../lib/hooks/useInterval'
import { reportError } from '../../lib/errors'
import hasQueueChanged from './helpers/hasQueueChanged'
import { useRouter } from 'next/router'
import { trackEvent } from '../../lib/matomo'
import { AUDIO_PLAYER_TRACK_CATEGORY } from './constants'
import { AudioElementState } from './AudioPlayer/AudioPlaybackElement'

const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 30
const SKIP_BACKWARD_TIME = 10
const SAVE_MEDIA_PROGRESS_INTERVAL = 5000 // in ms

const PATHS_WITH_DELAYED_INITIALIZATION: string[] = ['/mitteilung']

/**
 * Enum to represent the state of the react-native-track-player lib.
 * Check here for a reference ot this enum:
 * https://react-native-track-player.js.org/docs/api/constants/state
 */
enum NativeAudioPlayerState {
  None = 'none',
  Ready = 'ready',
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
  Buffering = 'buffering',
  Connecting = 'connecting',
}

export type AudioPlayerProps = {
  isVisible: boolean
  setWebHandlers: (handlers: AudioEventHandlers) => void
  activeItem: AudioQueueItem | null
  queue: AudioQueueItem[]
  autoPlay?: boolean
  playbackRate: number
  currentTime: number
  duration: number
  isPlaying: boolean
  isLoading: boolean
  isSeeking: boolean
  hasError: boolean
  actions: {
    onPlay: () => void
    onPause: () => void
    onStop: () => void
    onSeek: (progress: number) => void
    onForward: () => void
    onBackward: () => void
    onClose: () => void
    onPlaybackRateChange: (value: number) => void
    onEnded: () => void
    onSkipToNext: () => void
    handleError: (err: Error | string) => void
    syncWithMediaElement: (state: AudioElementState) => void
  }
  buffered: TimeRanges
}

type AppAudioPlayerState = {
  playerState: NativeAudioPlayerState
  currentTime: number
  duration: number
  playbackRate: number
}

type AudioPlayerContainerProps = {
  children: (props: AudioPlayerProps) => ReactNode
}

const AudioPlayerController = ({ children }: AudioPlayerContainerProps) => {
  const { pathname } = useRouter()
  const { inNativeApp } = useInNativeApp()
  const { setAudioPlayerVisible } = useAudioContext()
  const {
    audioQueue,
    audioQueueIsLoading,
    addAudioQueueItem,
    removeAudioQueueItem,
    refetchAudioQueue,
  } = useAudioQueue()
  const { saveMediaProgress } = useMediaProgress()

  // State that holds callbacks provided by the AudioPlaybackElement
  // When using the web-player.
  const audioEventHandlers = useRef<AudioEventHandlers>(null)
  const setWebHandlers = (updatedHandlers: AudioEventHandlers) => {
    audioEventHandlers.current = updatedHandlers
  }

  const trackedQueue = useRef<AudioQueueItem[]>(null)
  const [initialized, setInitialized] = useState(false)
  const [activePlayerItem, setActivePlayerItem] =
    useState<AudioQueueItem | null>(null)
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState<TimeRanges>(null)
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

  const handleError = (error: Error | string) => {
    setHasError(true)
    if (typeof error === 'string') {
      reportError('handle audio-error', error)
      trackEvent([AUDIO_PLAYER_TRACK_CATEGORY, 'error', error])
    } else {
      reportError(
        'handle audio-error',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      )
      trackEvent([
        AUDIO_PLAYER_TRACK_CATEGORY,
        'error',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      ])
    }
  }

  const saveActiveItemProgress = useCallback(
    async (forcedState?: { currentTime?: number; isPlaying?: boolean }) => {
      const { mediaId } = activePlayerItem?.document.meta?.audioSource ?? {}
      if (duration < (forcedState?.currentTime ?? currentTime)) {
        trackEvent([
          AUDIO_PLAYER_TRACK_CATEGORY,
          'updateProgress',
          'illegalUpdate',
          `upsert-value was ${
            forcedState?.currentTime ?? currentTime
          }, track duration is ${duration}, mediaId is ${mediaId}`,
        ])
        return
      }

      return saveMediaProgress(
        mediaId,
        forcedState?.currentTime ?? currentTime,
        forcedState?.isPlaying ?? isPlaying,
      )
    },
    [activePlayerItem, currentTime, isPlaying, saveMediaProgress, duration],
  )

  // Sync the Web-UI with the native audio player
  const syncWithNativeApp = useCallback(
    (state: AppAudioPlayerState) => {
      console.log('syncWithNativeApp')
      if (!inNativeApp) return
      // Don't update the currentTime & duration
      // if the native player wasn't yet able to load the media
      // TODO: find out why the track-player sometimes provides currentTime = 0
      // when state is ready
      if (
        ![
          NativeAudioPlayerState.None,
          NativeAudioPlayerState.Connecting,
          NativeAudioPlayerState.Ready,
        ].includes(state.playerState)
      ) {
        setDuration(state.duration)
        setCurrentTime(state.currentTime)
      }
      setPlaybackRate(state.playbackRate)
      setIsPlaying(
        [
          NativeAudioPlayerState.Playing,
          NativeAudioPlayerState.Buffering,
        ].includes(state.playerState),
      )
      setIsLoading(
        [
          NativeAudioPlayerState.Buffering,
          NativeAudioPlayerState.Connecting,
          NativeAudioPlayerState.None,
        ].includes(state.playerState),
      )
    },
    [inNativeApp],
  )

  // Sync the Web-UI with the HTML5 audio element
  const syncWithMediaElement = (state: AudioElementState) => {
    try {
      setCurrentTime(state.currentTime)
      setDuration(state.duration)
      setPlaybackRate(state.playbackRate)
      setIsPlaying(state.isPlaying)
      setIsLoading(state.isLoading)
      setBuffered(state.buffered)
    } catch (error) {
      handleError(error)
    }
  }

  const onPlay = async () => {
    console.log('onPlay', audioEventHandlers.current)
    try {
      // In case the queue has ended, readd the last played item to the queue and play it
      if (activePlayerItem && audioQueue.length === 0) {
        await addAudioQueueItem(activePlayerItem.document, 1)
      }

      if (inNativeApp) {
        notifyApp(AudioEvent.PLAY)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handlePlay()
      }
    } catch (error) {
      handleError(error)
    }
  }

  const onPause = async () => {
    try {
      if (!activePlayerItem || !isPlaying) return
      if (inNativeApp) {
        notifyApp(AudioEvent.PAUSE)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handlePause()
      }
      await saveActiveItemProgress({
        isPlaying: false,
      })
    } catch (error) {
      handleError(error)
    }
  }

  const onStop = () => {
    try {
      if (!activePlayerItem) {
        return
      }
      setShouldAutoPlay(false)
      if (inNativeApp) {
        notifyApp(AudioEvent.STOP)
      } else if (audioEventHandlers.current) {
        audioEventHandlers.current.handleStop()
      }
      setIsVisible(false)
    } catch (error) {
      handleError(error)
    }
  }

  const onSeek = async (progress: number) => {
    try {
      if (!activePlayerItem) return

      const updatedCurrentTime = progress * duration

      if (inNativeApp) {
        notifyApp(AudioEvent.SEEK, progress * duration)
      } else if (audioEventHandlers.current) {
        // TODO: call seek
        await audioEventHandlers.current.handleSeekTo(progress * duration)
      }

      await saveActiveItemProgress({
        currentTime: updatedCurrentTime,
        isPlaying: false,
      })
    } catch (error) {
      handleError(error)
    }
  }

  const onForward = async () => {
    try {
      if (!activePlayerItem) return

      const updatedCurrentTime = currentTime + SKIP_FORWARD_TIME

      if (inNativeApp) {
        notifyApp(AudioEvent.FORWARD, SKIP_FORWARD_TIME)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handleForward(SKIP_FORWARD_TIME)
      }
      await saveActiveItemProgress({
        currentTime: updatedCurrentTime,
        isPlaying: false,
      })
    } catch (error) {
      handleError(error)
    }
  }

  const onBackward = async () => {
    try {
      if (!activePlayerItem) return

      const updatedCurrentTime = currentTime - SKIP_BACKWARD_TIME

      if (inNativeApp) {
        notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
      } else if (audioEventHandlers.current) {
        // TODO: call backward
        await audioEventHandlers.current.handleBackward(SKIP_BACKWARD_TIME)
      }
      await saveActiveItemProgress({
        currentTime: updatedCurrentTime,
        isPlaying: false,
      })
    } catch (error) {
      handleError(error)
    }
  }

  const onPlaybackRateChange = async (value: number) => {
    try {
      if (!activePlayerItem) return
      trackEvent([AUDIO_PLAYER_TRACK_CATEGORY, 'playbackRate', value])
      if (inNativeApp) {
        notifyApp(AudioEvent.PLAYBACK_RATE, value)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handlePlaybackRateChange(value)
      }
      setPlaybackRate(value)
    } catch (error) {
      handleError(error)
    }
  }

  // Handle track ending on media element
  const onQueueAdvance = async () => {
    if (!activePlayerItem) {
      return
    }
    try {
      console.log('onQueueAdvance')
      const { data } = await removeAudioQueueItem(activePlayerItem.id)
      console.log('onQueueAdvance', data)
      if (data.audioQueueItems.length > 0) {
        console.log('onQueueAdvance: play next', {
          shouldAutoPlay,
        })
        const nextUp = data.audioQueueItems[0]
        setShouldAutoPlay(true)
        setActivePlayerItem(nextUp)
      } else {
        trackEvent([AUDIO_PLAYER_TRACK_CATEGORY, 'queue', 'ended'])
        setShouldAutoPlay(false)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const playQueue = useCallback(async () => {
    try {
      if (!audioQueue || audioQueue.length === 0) {
        // In case the audioQueue is not yet available (slow audio-queue sync)
        // Set should auto-play to allow onCanPlay to trigger play once ready
        setShouldAutoPlay(true)
        return
      }
      const nextUp = audioQueue[0]
      setActivePlayerItem(nextUp)
      setIsVisible(true)
      await onPlay()
    } catch (error) {
      handleError(error)
    }
  }, [audioQueue, onPlay])

  useInterval(
    saveActiveItemProgress,
    isPlaying ? SAVE_MEDIA_PROGRESS_INTERVAL : null,
  )

  useEffect(() => {
    if (!initialized) {
      return
    }
    // Notify the app of any changes to the queue
    if (
      inNativeApp &&
      audioQueue &&
      hasQueueChanged(trackedQueue?.current, audioQueue)
    ) {
      notifyApp(AudioEvent.QUEUE_UPDATE, audioQueue)
    }

    // React to queue updates
    if (
      audioQueue &&
      audioQueue.length > 0 &&
      hasQueueChanged(trackedQueue?.current, audioQueue)
    ) {
      // In case the queue changed while not visible,
      // toggle the visibility back on
      setIsVisible(true)

      // IF the head of the queue changed, update the active player item
      if (audioQueue[0].id !== activePlayerItem?.id) {
        setActivePlayerItem(audioQueue[0])
        setShouldAutoPlay(true)
      }
    }
    trackedQueue.current = audioQueue
  }, [initialized, inNativeApp, audioQueue])

  // Initialize the player once the queue has loaded.
  // Open up the audio-player once the app has started if the queue is not empty
  useEffect(() => {
    if (
      initialized ||
      PATHS_WITH_DELAYED_INITIALIZATION.includes(pathname) ||
      audioQueueIsLoading ||
      !audioQueue ||
      audioQueue.length == 0
    ) {
      return
    }
    if (audioQueue.length > 0) {
      const nextUp = audioQueue[0]
      setActivePlayerItem(nextUp)
      setShouldAutoPlay(false)
      setIsVisible(true)
    }
    setInitialized(true)
  }, [audioQueue, initialized, audioQueueIsLoading, pathname])

  // Sync audio-player visible with audio-context
  useEffect(() => {
    setAudioPlayerVisible(isVisible)
  }, [isVisible])

  // refetch the queue to check for possible changes once the tab is opened again
  useEffect(() => {
    const handler = async () => {
      const documentIsVisible = document.visibilityState === 'visible'
      if (documentIsVisible && !isPlaying) {
        setShouldAutoPlay(false)
        await refetchAudioQueue()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  useAudioContextEvent<void>('togglePlayer', playQueue)
  useNativeAppEvent(AudioEvent.SYNC, syncWithNativeApp, [initialized])
  useNativeAppEvent(AudioEvent.QUEUE_ADVANCE, onQueueAdvance, [initialized])
  useNativeAppEvent(AudioEvent.ERROR, handleError, [initialized])

  return (
    <>
      {children({
        isVisible,
        setWebHandlers,
        activeItem: activePlayerItem,
        queue: audioQueue,
        autoPlay: shouldAutoPlay,
        isLoading: isPlaying && isLoading,
        isPlaying,
        isSeeking: false,
        currentTime: currentTime,
        duration:
          duration !== 0
            ? duration
            : (activePlayerItem?.document?.meta?.audioSource?.durationMs || 0) /
              1000,
        playbackRate,
        actions: {
          onPlay,
          onPause,
          onStop,
          onSeek,
          onForward,
          onBackward,
          onClose: onStop,
          onPlaybackRateChange,
          onEnded: onQueueAdvance,
          onSkipToNext: onQueueAdvance,
          handleError,
          syncWithMediaElement,
        },
        buffered,
        hasError,
      })}
    </>
  )
}

export default AudioPlayerController
