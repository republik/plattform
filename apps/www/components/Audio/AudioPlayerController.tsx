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
import useTimeout from '../../lib/hooks/useTimeout'
import { clamp } from './helpers/clamp'

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
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
  setWebHandlers: (handlers: AudioEventHandlers) => void
  setHasAutoPlayed: () => void
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
  itemId: string
  playerState: NativeAudioPlayerState
  currentTime: number
  duration: number
  playbackRate: number
  forceUpdate?: boolean
}

type AudioPlayerContainerProps = {
  children: (props: AudioPlayerProps) => ReactNode
}

const AudioPlayerController = ({ children }: AudioPlayerContainerProps) => {
  const { pathname } = useRouter()
  const { inNativeApp } = useInNativeApp()
  const {
    audioPlayerVisible: isVisible,
    setAudioPlayerVisible: setIsVisible,
    audioPlayerIsExpanded: isExpanded,
    setAudioPlayerIsExpanded: setIsExpanded,
  } = useAudioContext()
  const {
    audioQueue,
    audioQueueIsLoading,
    addAudioQueueItem,
    removeAudioQueueItem,
    refetchAudioQueue,
  } = useAudioQueue()
  const { getMediaProgress, saveMediaProgress } = useMediaProgress()

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
  const [hasError, setHasError] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState<TimeRanges>(null)
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

  const setOptimisticTimeUI = (playerItem: AudioQueueItem, initialTime = 0) => {
    const audioSource = playerItem?.document?.meta?.audioSource
    // Optimistic UI update
    if (audioSource) {
      const duration = audioSource.durationMs / 1000
      setDuration(duration || 0)
      setCurrentTime(initialTime)
    }
  }

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
      if (!inNativeApp) return
      console.log(
        'update from app',
        JSON.stringify({
          playerState: state.playerState,
        }),
      )
      // only update the optimistic UI if the track-player has started to play
      if (
        ![
          NativeAudioPlayerState.None,
          NativeAudioPlayerState.Connecting,
          NativeAudioPlayerState.Ready,
        ].includes(state.playerState)
      ) {
        setDuration(state.duration)
        setCurrentTime(state.currentTime)
        setIsPlaying(
          [
            NativeAudioPlayerState.Playing,
            NativeAudioPlayerState.Buffering,
          ].includes(state.playerState),
        )
      } else if (state.forceUpdate) {
        setCurrentTime(state.currentTime)
      }
      setIsLoading(
        [
          NativeAudioPlayerState.Buffering,
          NativeAudioPlayerState.Connecting,
          NativeAudioPlayerState.None,
        ].includes(state.playerState),
      )
      setPlaybackRate(state.playbackRate)
    },
    [inNativeApp, activePlayerItem],
  )

  // Sync the Web-UI with the HTML audio-element
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

  const fetchInitialTime = async (item: AudioQueueItem): Promise<number> => {
    const mediaId = item.document?.meta?.audioSource.mediaId
    const duration = item.document?.meta?.audioSource.durationMs / 1000
    if (mediaId && duration) {
      const progress = await getMediaProgress({
        mediaId,
        durationMs: duration,
      }).catch((error) =>
        console.error('Error fetching media-progress for ' + mediaId, error),
      )
      if (progress && progress >= duration - 10) {
        return 0
      }
      return progress || 0
    }
  }

  /**
   * Set up the app audio-player and return the fetched initial-time
   */
  const setUpAppPlayer = useCallback(
    async (
      item: AudioQueueItem,
      autoPlay = false,
      initialTime = 0,
    ): Promise<void> => {
      notifyApp(AudioEvent.SETUP_TRACK, {
        item,
        autoPlay,
        initialTime,
        playbackRate,
      })
    },
    [playbackRate],
  )

  const onPlay = async () => {
    try {
      // In case the queue has ended, readd the last played item to the queue and play it
      if (activePlayerItem && audioQueue.length === 0) {
        // Re-add item to queue-head
        await addAudioQueueItem(activePlayerItem.document, 1)
        setOptimisticTimeUI(activePlayerItem, 0)
        if (inNativeApp) {
          await setUpAppPlayer(activePlayerItem, true, 0)
        } else if (audioEventHandlers.current) {
          await audioEventHandlers.current.handlePlay
        }
        return
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

  const onStop = async () => {
    try {
      if (!activePlayerItem) {
        return
      }
      setShouldAutoPlay(false)
      if (inNativeApp) {
        notifyApp(AudioEvent.STOP)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handleStop()
      }
      setIsVisible(false)
    } catch (error) {
      handleError(error)
    }
  }

  const onSeek = async (progress: number) => {
    try {
      if (!activePlayerItem) return

      const updatedCurrentTime = clamp(progress * duration, 0, duration)
      setCurrentTime(updatedCurrentTime)

      if (inNativeApp) {
        notifyApp(AudioEvent.SEEK, progress * duration)
      } else if (audioEventHandlers.current) {
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

      setCurrentTime(updatedCurrentTime)
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

      setCurrentTime(updatedCurrentTime)
      if (inNativeApp) {
        notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
      } else if (audioEventHandlers.current) {
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

  const onSkipToNext = async () => {
    try {
      if (inNativeApp) {
        await onQueueAdvance()
        //notifyApp(AudioEvent.SKIP_TO_NEXT)
      } else if (audioEventHandlers.current) {
        await onQueueAdvance()
      }
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
      // Save the progress of the current track at 100%
      await saveActiveItemProgress({ currentTime: duration, isPlaying: false })
      const { data } = await removeAudioQueueItem(activePlayerItem.id)

      if (data.audioQueueItems.length === 0) {
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
      await setupNextAudioItem(nextUp, true)
    } catch (error) {
      handleError(error)
    }
  }, [audioQueue, setUpAppPlayer, onPlay, setOptimisticTimeUI])

  useInterval(
    saveActiveItemProgress,
    isPlaying ? SAVE_MEDIA_PROGRESS_INTERVAL : null,
  )

  // Clear the loading state after 5 seconds
  useTimeout(
    () => {
      setIsLoading(false)
    },
    isLoading ? 10000 : null,
  )

  // In case playback managed to start even though an error occurred
  // reset error after 100ms
  useTimeout(
    () => {
      setHasError(false)
    },
    hasError && isPlaying ? 100 : null,
  )

  const setupNextAudioItem = async (
    nextUp: AudioQueueItem,
    autoPlay: boolean,
  ) => {
    setActivePlayerItem(nextUp)
    setOptimisticTimeUI(nextUp)
    // Fetch initial time for the new item and then set up the player
    const initialTime = await fetchInitialTime(nextUp)
    // The code here can be called by the browser-refocusing
    // in that case auto-play is to be ignored

    setOptimisticTimeUI(nextUp, initialTime)
    if (inNativeApp) {
      return setUpAppPlayer(nextUp, autoPlay, initialTime)
    } else if (audioEventHandlers.current && autoPlay) {
      return audioEventHandlers.current.handlePlay(initialTime)
    }
  }

  useEffect(() => {
    if (!initialized) {
      return
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
        const nextUp = audioQueue[0]
        setupNextAudioItem(nextUp, true).catch(handleError)
      }
    }
    trackedQueue.current = audioQueue
  }, [initialized, inNativeApp, audioQueue, setUpAppPlayer])

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
      setupNextAudioItem(nextUp, false).catch(handleError)
    }
    setInitialized(true)
  }, [audioQueue, initialized, audioQueueIsLoading, pathname, setUpAppPlayer])

  // refetch the queue to check for possible changes once the tab is opened again
  useEffect(() => {
    const handler = async () => {
      const documentIsVisible = document.visibilityState === 'visible'
      if (documentIsVisible && !isPlaying) {
        await refetchAudioQueue()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  useAudioContextEvent<void>('togglePlayer', playQueue)

  useNativeAppEvent(AudioEvent.SYNC, syncWithNativeApp, [initialized])
  useNativeAppEvent<string>(
    AudioEvent.QUEUE_ADVANCE,
    async (itemId) => {
      const isHeadOfQueue =
        audioQueue && audioQueue.length > 0 && audioQueue[0].id === itemId
      const isActiveItem = activePlayerItem && activePlayerItem.id === itemId
      if (isHeadOfQueue || isActiveItem) {
        await onQueueAdvance()
      }
    },
    [initialized],
  )
  useNativeAppEvent(AudioEvent.ERROR, handleError, [initialized])

  return (
    <>
      {children({
        isVisible,
        isExpanded,
        setIsExpanded,
        setWebHandlers,
        setHasAutoPlayed: () => setShouldAutoPlay(false),
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
          // onEnded is web only
          onEnded: onQueueAdvance,
          onSkipToNext,
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
