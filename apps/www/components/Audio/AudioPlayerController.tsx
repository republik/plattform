import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import useNativeAppEvent from '../../lib/react-native/useNativeAppEvent'
import { useMediaProgress } from './MediaProgress'
import useInterval from '../../lib/hooks/useInterval'
import { reportError } from '../../lib/errors/reportError'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { AudioElementState } from './AudioPlayer/AudioPlaybackElement'
import useTimeout from '../../lib/hooks/useTimeout'
import { clamp } from './helpers/clamp'
import { AudioPlayerItem, AudioQueueItem } from './types/AudioPlayerItem'
import {
  AudioPlayerLocations,
  AudioPlayerActions,
} from './types/AudioActionTracking'
import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useGlobalAudioState } from './globalAudioState'
import { getFragmentData } from '#graphql/cms/__generated__/gql'
import { AudioQueueItemFragmentDoc } from '#graphql/republik-api/__generated__/gql/graphql'

const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 30
const SKIP_BACKWARD_TIME = 10
const SAVE_MEDIA_PROGRESS_INTERVAL = 5000 // in ms
const AUDIO_PLAYER_AUTOPLAY_STORAGE_KEY = 'audio-player-auto-play'

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
  activeItem: AudioQueueItem | null
  queue: AudioQueueItem[]
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
  isAutoPlayEnabled: boolean
  setAutoPlayEnabled: Dispatch<SetStateAction<boolean>>
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

const usePersistedAutoPlayToggle = createPersistedState<boolean>(
  AUDIO_PLAYER_AUTOPLAY_STORAGE_KEY,
)

const AudioPlayerController = ({ children }: AudioPlayerContainerProps) => {
  const { inNativeApp } = useInNativeApp()
  const [isAutoPlayEnabled, setAutoPlayEnabled] =
    usePersistedAutoPlayToggle<boolean>(false)
  const {
    activePlayerItem,
    setActivePlayerItem,
    audioPlayerVisible: isVisible,
    setAudioPlayerVisible: setIsVisible,
    isPlaying,
    setIsPlaying,
    isExpanded,
    setIsExpanded,
  } = useAudioContext()

  const { currentTime, setCurrentTime, duration, setDuration } =
    useGlobalAudioState()
  const {
    audioQueue,
    addAudioQueueItem,
    removeAudioQueueItem,
    checkIfHeadOfQueue,
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
  const firstTrackIsPrepared = useRef<boolean>(false)

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
    reportError('handle audio-error', error)
    trackEvent([
      AudioPlayerLocations.AUDIO_PLAYER,
      AudioPlayerActions.ERROR,
      error,
    ])
  }

  const saveActiveItemProgress = useCallback(
    async (forcedState?: { currentTime?: number; isPlaying?: boolean }) => {
      const { mediaId } = activePlayerItem?.document.meta?.audioSource ?? {}
      if (duration < (forcedState?.currentTime ?? currentTime)) {
        trackEvent([
          AudioPlayerLocations.AUDIO_PLAYER,
          AudioPlayerActions.ILLEGAL_PROGRESS_UPDATE,
          activePlayerItem?.document?.meta?.path,
          {
            currentTime: forcedState?.currentTime ?? currentTime,
            duration,
          },
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
    console.log('Audio Controller: fetchInitialTime', {
      mediaId,
      duration,
    })
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
      console.log('Audio Controller: setUpAppPlayer', {
        item,
        autoPlay,
        initialTime,
      })
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

    console.log('Audio Controller: setupNextAudioItem', {
      nextUp,
      autoPlay,
      initialTime,
    })

    setOptimisticTimeUI(nextUp, initialTime)
    if (inNativeApp) {
      return setUpAppPlayer(nextUp, autoPlay, initialTime)
    } else if (audioEventHandlers.current) {
      return audioEventHandlers.current.handleSetupTrack(
        nextUp,
        autoPlay,
        initialTime,
      )
    } else if (autoPlay) {
      // Handle auto-play being called before the audio-element could be loaded
      setHasDelayedAutoPlay(true)
    }
  }

  const onPlay = async () => {
    try {
      console.log('Audio Controller: onPlay')
      // After opening up the player, the first track is loaded
      // then when the user presses play for the first time, track as playTrack
      if (firstTrackIsPrepared?.current) {
        firstTrackIsPrepared.current = false
        trackEvent([
          AudioPlayerLocations.AUDIO_PLAYER,
          AudioPlayerActions.PLAY_TRACK,
          activePlayerItem?.document?.meta?.path,
        ])
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
      console.log('Audio Controller: onPause')
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
      if (inNativeApp) {
        notifyApp(AudioEvent.STOP)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handleStop()
      }

      if (shouldHide) {
        setIsVisible(false)
      }
      // Cleanup the internal state with a slight delay
      // to await the last syncs with the native app
      setTimeout(() => {
        setIsPlaying(false)
        setCurrentTime(0)
        setDuration(0)
        setActivePlayerItem(null)
        setBuffered(null)
        setHasDelayedAutoPlay(false)
        activeItemRef.current = null
        firstTrackIsPrepared.current = false
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

      if (inNativeApp) {
        notifyApp(AudioEvent.PLAYBACK_RATE, value)
      } else if (audioEventHandlers.current) {
        await audioEventHandlers.current.handlePlaybackRateChange(value)
      }

      setPlaybackRate(value)

      trackEvent([
        AudioPlayerLocations.AUDIO_PLAYER,
        AudioPlayerActions.PLAYBACK_RATE_CHANGED,
        value,
      ])
    } catch (error) {
      handleError(error)
    }
  }

  // Handle track ending on media element
  const onQueueAdvance = async (autoPlay: boolean) => {
    if (!activePlayerItem) {
      return
    }
    try {
      // Save the progress of the current track at 100%
      await saveActiveItemProgress({ currentTime: duration, isPlaying: false })
      const { data } = await removeAudioQueueItem(activePlayerItem.id)
      const audioQueueItems = getFragmentData(
        AudioQueueItemFragmentDoc,
        data.audioQueueItems,
      )

      console.log('Audio Controller: onQueueAdvance', {
        data,
        autoPlay,
      })

      audioQueueRef.current = [...audioQueueItems]
      setInitialized(true)
      if (data.audioQueueItems.length === 0) {
        setActivePlayerItem(null)
        if (inNativeApp && isPlaying) {
          onStop(false)
        }
        trackEvent([
          AudioPlayerLocations.AUDIO_PLAYER,
          AudioPlayerActions.QUEUE_ENDED,
          activePlayerItem?.document?.meta?.path,
        ])
      } else {
        const nextItem = audioQueueItems[0]
        setupNextAudioItem(nextItem, autoPlay).catch(handleError)
        trackEvent([
          AudioPlayerLocations.AUDIO_PLAYER,
          AudioPlayerActions.QUEUE_ADVANCE,
          nextItem?.document?.meta?.path,
        ])
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
          const isHeadOfQueue = checkIfHeadOfQueue(queueItem.document.id)
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
    async (item: AudioPlayerItem, location?: AudioPlayerLocations) => {
      try {
        const isHeadOfQueue = checkIfHeadOfQueue(item.id)
        let nextUp: AudioQueueItem
        // If the item to be played is already the first item in the queue
        // already just set the active item directly
        if (isHeadOfQueue && audioQueue?.length > 0) {
          nextUp = audioQueue?.[0]
        } else {
          const { data } = await addAudioQueueItem(item, 1)
          const queue = getFragmentData(
            AudioQueueItemFragmentDoc,
            data.audioQueueItems,
          )
          if (!queue || queue.length === 0) {
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

        trackEvent([
          location,
          nextUp?.document?.meta?.audioSource?.kind === 'syntheticReadAloud'
            ? AudioPlayerActions.PLAY_SYNTHETIC
            : AudioPlayerActions.PLAY_TRACK,
          nextUp?.document?.meta?.path,
        ])
      } catch (error) {
        handleError(error)
      }
    },
    [inNativeApp, setupNextAudioItem, setOptimisticTimeUI, audioQueue],
  )

  const togglePlayback = useCallback(async () => {
    console.log('Audio Controller: togglePlayback', {
      currentlyPlaying: isPlaying,
    })
    if (isPlaying) {
      await onPause()
    } else {
      await onPlay()
    }
  }, [isPlaying, onPlay, onPause])

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
   * If the player is visible and the queue is not empty, set up the first item
   */
  useEffect(() => {
    if (
      audioQueue &&
      audioQueue.length > 0 &&
      !activePlayerItem &&
      isVisible &&
      !firstTrackIsPrepared?.current
    ) {
      const nextUp = audioQueue[0]
      firstTrackIsPrepared.current = true
      setupNextAudioItem(nextUp, false).catch(handleError)
    }
  }, [audioQueue, activePlayerItem, isVisible])

  useAudioContextEvent<{
    item: AudioPlayerItem
    location?: AudioPlayerLocations
  }>(AudioContextEvent.TOGGLE_PLAYER, ({ item, location }) =>
    togglePlayer(item, location),
  )
  useAudioContextEvent<void>(AudioContextEvent.TOGGLE_PLAYBACK, togglePlayback)
  useAudioContextEvent<{
    item: AudioPlayerItem
    position?: number
  }>(AudioContextEvent.ADD_AUDIO_QUEUE_ITEM, ({ item, position }) =>
    addQueueItem(item, position),
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
        // HasOptedOutFromAutoPlay might be null, which should then result in 'true'
        await onQueueAdvance(isAutoPlayEnabled)
      }
    },
    [initialized, activePlayerItem, isAutoPlayEnabled],
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
        activeItem: activePlayerItem,
        queue: audioQueue,
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
          // onEnded is web only and is called whenever a track ends
          onEnded: () => onQueueAdvance(isAutoPlayEnabled),
          onSkipToNext: () => {
            onQueueAdvance(isPlaying)
            trackEvent([
              AudioPlayerLocations.AUDIO_PLAYER,
              AudioPlayerActions.SKIP_TO_NEXT,
              activePlayerItem?.document?.meta?.path,
            ])
          },
          handleError,
          syncWithMediaElement,
        },
        buffered,
        hasError,
        isAutoPlayEnabled,
        setAutoPlayEnabled,
      })}
    </>
  )
}

export default AudioPlayerController
