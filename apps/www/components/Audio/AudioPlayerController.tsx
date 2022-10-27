import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import {
  AudioContextEvent,
  useAudioContext,
  useAudioContextEvent,
} from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent, AudioEventHandlers } from './types/AudioEvent'
import notifyApp from '../../lib/react-native/NotifyApp'
import useAudioQueue from './hooks/useAudioQueue'
import { AudioQueueItem } from './graphql/AudioQueueHooks'
import useNativeAppEvent from '../../lib/react-native/useNativeAppEvent'
import { useMediaProgress } from './MediaProgress'
import useInterval from '../../lib/hooks/useInterval'
import { reportError } from '../../lib/errors'
import { trackEvent } from '../../lib/matomo'
import { AUDIO_PLAYER_TRACK_CATEGORY } from './constants'
import { AudioElementState } from './AudioPlayer/AudioPlaybackElement'
import useTimeout from '../../lib/hooks/useTimeout'
import { clamp } from './helpers/clamp'
import hasQueueChanged from './helpers/hasQueueChanged'
import { AudioPlayerItem } from './types/AudioPlayerItem'

const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 30
const SKIP_BACKWARD_TIME = 10
const SAVE_MEDIA_PROGRESS_INTERVAL = 5000 // in ms

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
  const { inNativeApp } = useInNativeApp()
  const {
    audioPlayerVisible: isVisible,
    setAudioPlayerVisible: setIsVisible,
    isPlaying,
    setIsPlaying,
    isExpanded,
    setIsExpanded,
  } = useAudioContext()
  const {
    audioQueue,
    addAudioQueueItem,
    removeAudioQueueItem,
    checkIfActiveItem,
  } = useAudioQueue()
  const { getMediaProgress, saveMediaProgress } = useMediaProgress()

  // State that holds callbacks provided by the AudioPlaybackElement
  // When using the web-player.
  const audioEventHandlers = useRef<AudioEventHandlers>(null)
  const setWebHandlers = (updatedHandlers: AudioEventHandlers) => {
    audioEventHandlers.current = updatedHandlers
  }

  const activeItemRef = useRef<AudioQueueItem | null>(null)
  const audioQueueRef = useRef<AudioQueueItem[] | null>(null)

  const [initialized, setInitialized] = useState(false)
  const [activePlayerItem, setActivePlayerItem] =
    useState<AudioQueueItem | null>(null)
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState<TimeRanges>(null)
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

  const [hasDelayedAutoPlay, setHasDelayedAutoPlay] = useState(false)

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
    [inNativeApp],
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
        coverImage: item.document.meta.coverForNativeApp,
      })
    },
    [playbackRate],
  )

  const setupNextAudioItem = async (
    nextUp: AudioQueueItem,
    autoPlay: boolean,
  ) => {
    activeItemRef.current = nextUp
    setActivePlayerItem(nextUp)
    setOptimisticTimeUI(nextUp)
    // Fetch initial time for the new item and then set up the player
    const initialTime = await fetchInitialTime(nextUp)
    // The code here can be called by the browser-refocusing
    // in that case auto-play is to be ignored

    setOptimisticTimeUI(nextUp, initialTime)
    if (inNativeApp) {
      return setUpAppPlayer(nextUp, autoPlay, initialTime)
    } else if (audioEventHandlers.current) {
      if (autoPlay) {
        return audioEventHandlers.current.handlePlay(initialTime)
      } else {
        return audioEventHandlers.current.handleSetPosition(initialTime)
      }
    } else if (autoPlay) {
      // Handle auto-play being called before the audio-element could be loaded
      setHasDelayedAutoPlay(true)
    }
  }

  const onPlay = async () => {
    try {
      // In case the queue has ended, readd the last played item to the queue and play it
      if (activePlayerItem && audioQueue?.length === 0) {
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

  const onStop = async (shouldHide = true) => {
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

      if (shouldHide) {
        console.log('Hiding audio player')
        setIsVisible(false)
      }
      // Cleanup the internal state with a slight delay
      // to await the last syncs with the native app
      setTimeout(() => {
        setIsPlaying(false)
        setCurrentTime(0)
        setDuration(0)
        console.log('Resetting audio player')
        setActivePlayerItem(null)
        setBuffered(null)
        setHasDelayedAutoPlay(false)
        activeItemRef.current = null
      }, 100)
      setInitialized(false)
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

  // Handle track ending on media element
  const onQueueAdvance = async (shouldAutoPlay = true) => {
    if (!activePlayerItem) {
      return
    }
    try {
      // Save the progress of the current track at 100%
      await saveActiveItemProgress({ currentTime: duration, isPlaying: false })
      const { data } = await removeAudioQueueItem(activePlayerItem.id)

      audioQueueRef.current = data.audioQueueItems
      setInitialized(true)
      if (data.audioQueueItems.length === 0) {
        trackEvent([AUDIO_PLAYER_TRACK_CATEGORY, 'queue', 'ended'])
        setShouldAutoPlay(false)
      } else {
        trackEvent([AUDIO_PLAYER_TRACK_CATEGORY, 'queue', 'advance'])
        setupNextAudioItem(data.audioQueueItems[0], shouldAutoPlay).catch(
          handleError,
        )
      }
    } catch (error) {
      handleError(error)
    }
  }

  const addQueueItem = useCallback(
    async (item: AudioPlayerItem, position?: number) => {
      await addAudioQueueItem(item, position).catch(handleError)
    },
    [addAudioQueueItem],
  )

  const removeQueueItem = useCallback(
    async (audioQueueItemId: string) => {
      try {
        const queueItem = audioQueue?.find(({ id }) => id === audioQueueItemId)

        if (queueItem) {
          const isHeadOfQueue = checkIfActiveItem(queueItem.document.id)
          if (isHeadOfQueue && audioQueue?.length > 1) {
            setupNextAudioItem(audioQueue[1], false).catch(handleError)
          }
          const { data } = await removeAudioQueueItem(audioQueueItemId)
          const queue = data.audioQueueItems
          if (queue?.length === 0) {
            onStop(false)
          }
          // If the head of the queue was removed, setup the new head
        }
      } catch (error) {
        handleError(error)
      }
    },
    [audioQueue, setupNextAudioItem, removeAudioQueueItem],
  )

  const togglePlayer = useCallback(
    async (item: AudioPlayerItem) => {
      try {
        const isHeadOfQueue = checkIfActiveItem(item.id)
        let nextUp
        // If the item to be played is already the first item in the queue
        // already just set the active item directly
        if (isHeadOfQueue && audioQueue?.length > 0) {
          nextUp = audioQueue?.[0]
        } else {
          const { data } = await addAudioQueueItem(item, 1)
          const queue = data.audioQueueItems
          console.log('Toggling audio player', queue)
          if (!queue || queue.length === 0) {
            // In case the audioQueue is not yet available (slow audio-queue sync)
            // Set should auto-play to allow onCanPlay to trigger play once ready
            setShouldAutoPlay(true)
            return
          }

          nextUp = queue[0]
        }
        activeItemRef.current = nextUp
        await setupNextAudioItem(nextUp, true)
        setIsVisible(true)

        if (inNativeApp) {
          notifyApp(AudioEvent.PLAY)
        }
      } catch (error) {
        handleError(error)
      }
    },
    [inNativeApp, setupNextAudioItem, setOptimisticTimeUI, audioQueue],
  )

  useInterval(
    saveActiveItemProgress,
    isPlaying ? SAVE_MEDIA_PROGRESS_INTERVAL : null,
  )

  // If the player is stuck in loading state reset after 10 seconds
  useTimeout(
    () => {
      setIsPlaying(false)
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

  // Set visibility to false if the miniplayer is supposed to be
  // rendered when the queue is empty
  useEffect(() => {
    if (!isExpanded && audioQueue?.length === 0 && isVisible) {
      setIsVisible(false)
    }
  }, [audioQueue, isExpanded])

  // In case of delayed auto-play, play the audio once the audio-element is ready
  useEffect(() => {
    if (hasDelayedAutoPlay && audioEventHandlers.current) {
      onPlay().then(() => setHasDelayedAutoPlay(false))
    }
  })

  /**
   * If the player is visible and the queue is not empty, setup the first item
   */
  useEffect(() => {
    if (audioQueue && audioQueue.length > 0 && !activePlayerItem && isVisible) {
      const nextUp = audioQueue[0]
      setupNextAudioItem(nextUp, false).catch(handleError)
    }
  }, [audioQueue, activePlayerItem, isVisible])

  useAudioContextEvent<AudioPlayerItem>(
    AudioContextEvent.TOGGLE_PLAYER,
    togglePlayer,
  )
  useAudioContextEvent<{ item: AudioPlayerItem; position?: number }>(
    AudioContextEvent.ADD_AUDIO_QUEUE_ITEM,
    ({ item, position }) => addQueueItem(item, position),
  )
  useAudioContextEvent<string>(
    AudioContextEvent.REMOVE_AUDIO_QUEUE_ITEM,
    removeQueueItem,
  )

  useNativeAppEvent(AudioEvent.SYNC, syncWithNativeApp, [
    initialized,
    activePlayerItem,
  ])
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
    [initialized, activePlayerItem],
  )
  useNativeAppEvent(AudioEvent.ERROR, handleError, [
    initialized,
    activePlayerItem,
  ])

  // The following two hooks allow for minimizing the player on backpress in android
  useEffect(() => {
    notifyApp(AudioEvent.UPDATE_UI_STATE, {
      isExpanded,
      isVisible,
    })
  }, [isExpanded, isVisible])

  useNativeAppEvent(
    AudioEvent.MINIMIZE_PLAYER,
    () => {
      if (isExpanded) {
        setIsExpanded(false)
      }
    },
    [initialized],
  )

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
          onEnded: () => onQueueAdvance(true),
          onSkipToNext: () => onQueueAdvance(isPlaying),
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
