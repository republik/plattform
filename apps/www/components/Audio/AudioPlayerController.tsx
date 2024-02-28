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
import { AudioQueueItem } from './graphql/AudioQueueHooks'
import useNativeAppEvent from '../../lib/react-native/useNativeAppEvent'
import { useMediaProgress } from './MediaProgress'
import useInterval from '../../lib/hooks/useInterval'
import { reportError } from '../../lib/errors/reportError'
import { trackEvent } from '../../lib/matomo'
import { AudioElementState } from './AudioPlayer/AudioPlaybackElement'
import useTimeout from '../../lib/hooks/useTimeout'
import { clamp } from './helpers/clamp'
import { AudioPlayerItem } from './types/AudioPlayerItem'
import {
  AudioPlayerLocations,
  AudioPlayerActions,
} from './types/AudioActionTracking'
import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useGlobalAudioState } from './globalAudioState'
import { useMachine } from '@xstate/react'
import { AudioPlayerStateMachine } from 'lib/audio-player/audio-player'
import { WebAudioPlayer } from 'lib/audio-player/web-audio-player'
import {
  AudioPlayerEventMap,
  IAudioTrack,
} from 'lib/audio-player/audio-player.interface'

const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 30
const SKIP_BACKWARD_TIME = 10
const SAVE_MEDIA_PROGRESS_INTERVAL = 5000 // in ms
const AUDIO_PLAYER_AUTOPLAY_STORAGE_KEY = 'audio-player-auto-play'

function mapAudioQueueItemToAudioTrack(item: AudioQueueItem): IAudioTrack {
  return {
    id: item.id,
    src: item.document.meta.audioSource.mp3,
    duration: item.document.meta.audioSource.durationMs / 1000,
  }
}

/**
 * Map the audio queue to the audio tracks
 * The audio tracks are a reduced version of the audio queue items
 * that only contain the necessary information for the audio player
 * @param queue The audio queue
 * @returns The audio tracks
 */
function mapAudioQueueToAudioTracks(queue: AudioQueueItem[]): IAudioTrack[] {
  return queue.map(mapAudioQueueItemToAudioTrack)
}

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
  Ready = 'Ready',
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
  const [state, send, service] = useMachine(AudioPlayerStateMachine)
  const audioRef = useRef<HTMLAudioElement>(null)

  const initialized = !state.matches('Idle')

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [buffered, setBuffered] = useState<TimeRanges>(null)

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      const hasPlayingState = state.matches('Playing')
      const hasLoadingState = state.matches('Loading')

      if (hasPlayingState !== isPlaying) setIsPlaying(hasPlayingState)
      if (hasPlayingState && !isVisible) setIsVisible(true)
      if (hasLoadingState !== isLoading) setIsLoading(hasLoadingState)
      if (duration !== state.context.currentTrack?.duration) {
        setDuration(state.context.currentTrack?.duration)
      }

      const { currentTrack, currentPosition } = state.context

      if (currentPosition !== currentTime) setCurrentTime(currentPosition)
      if (currentTrack && currentTrack?.id !== activePlayerItem?.id) {
        console.log(
          'setting active player item',
          currentTrack.id,
          activePlayerItem?.id,
        )
        setActivePlayerItem(
          currentTrack
            ? audioQueue.find((item) => item.id === currentTrack.id)
            : null,
        )
      }
    })
    return () => subscription.unsubscribe()
  }, [
    service,
    audioQueue,
    activePlayerItem,
    setIsPlaying,
    setIsLoading,
    setDuration,
    setActivePlayerItem,
  ])
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

  if (isAutoPlayEnabled !== state.context.autoPlay) {
    send({
      type: 'SET_AUTOPLAY',
      autoPlay: isAutoPlayEnabled,
    })
  }

  // detect queue tail changes
  useEffect(() => {
    const stateQueue = state.context.queue.map((i) => i.id)
    const audioQueueIds = audioQueue?.map((i) => i.id).slice(1)
    console.log('Audio Controller: queue changed', {
      audioQueueIds,
      stateQueue,
    })

    if (
      !state.matches('Idle') &&
      audioQueue
        ?.map((i) => i.id)
        .slice(1)
        .join() !== state.context.queue.map((i) => i.id).join()
    ) {
      console.log('Audio Controller: queue changed', {
        audioQueue,
        stateQueue: state.context.queue,
      })
      // alert('queue changed')
      send({
        type: 'UPDATE_QUEUE',
        queue: mapAudioQueueToAudioTracks(
          audioQueue.slice(state.context.currentTrack !== null ? 1 : 0) || [],
        ),
      })
    }
  }, [audioQueue, state.value.toString(), state.context.queue])

  // useEffect(() => {
  //   if (isAutoPlayEnabled !== state.context.autoPlay) {
  //     send({
  //       type: 'SET_AUTOPLAY',
  //       autoPlay: isAutoPlayEnabled,
  //     })
  //   }
  // }, [isAutoPlayEnabled, state.context.autoPlay])

  useEffect(() => {
    if (
      initialized ||
      !audioRef.current ||
      !audioQueue ||
      audioQueue.length === 0
    ) {
      return
    }
    send({
      type: 'PREPARE',
      queue: mapAudioQueueToAudioTracks(audioQueue || []),
      player: audioRef.current ? new WebAudioPlayer(audioRef.current) : null,
    })
    send({
      type: 'SETUP',
      queue: mapAudioQueueToAudioTracks(audioQueue || []),
    })
  }, [audioQueue, audioRef, initialized, send])

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
    } else {
      error = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      reportError('handle audio-error', error)
    }
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
  // const setUpAppPlayer = useCallback(
  //   async (
  //     item: AudioQueueItem,
  //     autoPlay = false,
  //     initialTime = 0,
  //   ): Promise<void> => {
  //     console.log('Audio Controller: setUpAppPlayer', {
  //       item,
  //       autoPlay,
  //       initialTime,
  //     })
  //     notifyApp(AudioEvent.SETUP_TRACK, {
  //       item,
  //       autoPlay,
  //       initialTime,
  //       playbackRate,
  //       coverImage: item.document.meta.coverForNativeApp,
  //     })
  //   },
  //   [playbackRate],
  // )

  const setupNextAudioItem = async (
    queue: AudioQueueItem[],
    autoPlay: boolean,
  ) => {
    const [nextUp] = queue
    // setActivePlayerItem(nextUp)
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
    // if (inNativeApp) {
    // return setUpAppPlayer(nextUp, autoPlay, initialTime)
    // }
    send({
      type: 'SETUP',
      queue: mapAudioQueueToAudioTracks(queue),
      initialPosition: initialTime,
      startPlayback: true,
    })
    send({
      type: 'PLAY',
    })
  }

  const onPlay = async () => {
    try {
      console.log('Audio Controller: onPlay')

      if (inNativeApp) {
        notifyApp(AudioEvent.PLAY)
      }

      send({
        type: 'PLAY',
      })
    } catch (error) {
      handleError(error)
    }
  }

  const onPause = async () => {
    try {
      if (!activePlayerItem) return
      console.log('Audio Controller: onPause')
      if (!activePlayerItem || !isPlaying) return
      // if (inNativeApp) {
      // notifyApp(AudioEvent.PAUSE)
      // }

      send({
        type: 'PAUSE',
      })
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
      console.log('Audio Controller: onStop')
      // if (inNativeApp) {
      //   notifyApp(AudioEvent.STOP)
      //   // Cleanup the internal state with a slight delay
      //   // to await the last syncs with the native app
      //   setTimeout(() => {
      //     setIsPlaying(false)
      //     setCurrentTime(0)
      //     setDuration(0)
      //     // setActivePlayerItem(null)
      //     setBuffered(null)
      //     setHasDelayedAutoPlay(false)
      //     // activeItemRef.current = null
      //     // firstTrackIsPrepared.current = false
      //   }, 100)
      // }

      send({
        type: 'STOP',
      })

      if (shouldHide) {
        setIsVisible(false)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const onSeek = async (progress: number) => {
    try {
      if (!activePlayerItem) return
      console.log('Audio Controller: onSeek', progress)

      const updatedCurrentTime = clamp(progress * duration, 0, duration)
      setCurrentTime(updatedCurrentTime)

      // if (inNativeApp) {
      // notifyApp(AudioEvent.SEEK, progress * duration)
      // }

      send({
        type: 'SEEK',
        currentPosition: state.context.currentTrack.duration * progress,
      })

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
      console.log('Audio Controller: onForward')

      const updatedCurrentTime = currentTime + SKIP_FORWARD_TIME

      setCurrentTime(updatedCurrentTime)
      // if (inNativeApp) {
      // notifyApp(AudioEvent.FORWARD, SKIP_FORWARD_TIME)
      // }
      send({
        type: 'FORWARD',
        secs: SKIP_FORWARD_TIME,
      })
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
      console.log('Audio Controller: onBackward')

      const updatedCurrentTime = currentTime - SKIP_BACKWARD_TIME

      setCurrentTime(updatedCurrentTime)
      // if (inNativeApp) {
      // notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
      // }
      send({
        type: 'BACKWARD',
        secs: SKIP_BACKWARD_TIME,
      })
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
      console.log('Audio Controller: onPlaybackRateChange', value)
      // if (inNativeApp) {
      // notifyApp(AudioEvent.PLAYBACK_RATE, value)
      // }

      send({
        type: 'SET_PLAYBACKRATE',
        playbackRate: value,
      })

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
  const advanceQueue = async () => {
    if (!activePlayerItem) {
      return
    }
    try {
      //     // Save the progress of the current track at 100%
      await saveActiveItemProgress({ currentTime: duration, isPlaying: false })
      // optimisitcally set the next track
      const [head] = audioQueue
      // setActivePlayerItem(queue?.[0] || null)
      const { data } = await removeAudioQueueItem(head.id)
      console.log('Audio Controller: advance queue', {
        activePlayerItem,
        audioQueue,
      })
      send({
        type: 'END',
      })
      if (data.audioQueueItems?.length > 0) {
        setupNextAudioItem(data.audioQueueItems, isPlaying)
      }
      trackEvent([
        AudioPlayerLocations.AUDIO_PLAYER,
        AudioPlayerActions.QUEUE_ENDED,
        activePlayerItem?.document?.meta?.path,
      ])
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
        console.log('Audio Controller: removeQueueItem', audioQueueItemId)
        const queueItem = audioQueue?.find(({ id }) => id === audioQueueItemId)

        if (queueItem) {
          // TODO
          // const isHeadOfQueue = checkIfHeadOfQueue(queueItem.document.id)
          // if (isHeadOfQueue && audioQueue?.length > 1) {
          // setupNextAudioItem(audioQueue, false).catch(handleError)
          // }
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
          await setupNextAudioItem(audioQueue, true)
        } else {
          const { data } = await addAudioQueueItem(item, 1)
          const queue = data.audioQueueItems
          if (!queue || queue.length === 0) {
            return
          }

          nextUp = queue[0]
          await setupNextAudioItem(queue, true)
        }
        // activeItemRef.current = nextUp
        setIsVisible(true)

        // TODO: why is this needed 👇🏻 ?
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

  // // In case of delayed auto-play, play the audio once the audio-element is ready
  // useEffect(() => {
  //   if (hasDelayedAutoPlay && audioEventHandlers.current) {
  //     onPlay().then(() => setHasDelayedAutoPlay(false))
  //   }
  // })

  /**
   * If the player is visible and the queue is not empty, set up the first item
   */
  // useEffect(() => {
  //   if (
  //     audioQueue &&
  //     audioQueue.length > 0 &&
  //     !activePlayerItem &&
  //     isVisible &&
  //     !firstTrackIsPrepared?.current
  //   ) {
  //     const nextUp = audioQueue[0]
  //     firstTrackIsPrepared.current = true
  //     setupNextAudioItem(nextUp, false).catch(handleError)
  //   }
  // }, [audioQueue, activePlayerItem, isVisible])

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

  /**
   * ===========================
   * START NATIVE-APP
   * ===========================
   */

  useNativeAppEvent(AudioEvent.SYNC, syncWithNativeApp, [
    initialized,
    activePlayerItem,
  ])

  useNativeAppEvent<string>(
    AudioEvent.QUEUE_ADVANCE,
    async (itemId) => {
      // const isHeadOfQueue =
      //   audioQueue && audioQueue.length > 0 && audioQueue[0].id === itemId
      // const isActiveItem = activePlayerItem && activePlayerItem.id === itemId
      // if (isHeadOfQueue || isActiveItem) {
      //   // HasOptedOutFromAutoPlay might be null, which should then result in 'true'
      //   await onQueueAdvance(isAutoPlayEnabled)
      // }
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

  /**
   * ===========================
   * END NATIVE-APP
   * ===========================
   */

  // Add/Remove listeners from state.context.audioController
  useEffect(() => {
    const { player } = state.context
    if (!initialized || !player) {
      return
    }
    // console.log('Audio Controller: add/remove listeners', {
    //   state: state.value.toString(),
    // })

    const onEnded = () => {
      advanceQueue()
    }
    const updatePosition = (event: AudioPlayerEventMap['updatePosition']) => {
      send({
        type: 'UPDATE_POSITION',
        position: event.position,
      })
    }

    const onloaded = (e: AudioPlayerEventMap['loaded']) => {
      setIsLoading(false)
      send({
        type: 'SET_DURATION',
        duration: e.duration,
      })
    }

    const onbuffering = (e: AudioPlayerEventMap['buffering']) => {
      console.log('Audio Controller: onbuffering', e.percent)
    }

    const onerror = (e: AudioPlayerEventMap['error']) => {
      console.log('Audio Controller: onerror')
      handleError(new Error('Audio element error'))
    }

    const listenerIds = [
      player.addEventListener('ended', onEnded),
      player.addEventListener('updatePosition', updatePosition),
      player.addEventListener('loaded', onloaded),
      // audioController.addEventListener('buffering', onbuffering),
      // audioController.addEventListener('error', onerror),
    ]

    return () => {
      listenerIds.forEach((id) => player.removeEventListener(id))
    }
  }, [
    initialized,
    state.context.player,
    advanceQueue,
    send,
    setIsLoading,
    setDuration,
    handleError,
  ])
  // console.log('activePlayerItem', activePlayerItem?.document?.meta?.title)

  return (
    <>
      {children({
        isVisible,
        isExpanded,
        setIsExpanded,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setWebHandlers: () => {},
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
          // onEnded: () => onQueueAdvance(isAutoPlayEnabled),
          onEnded: () => {
            advanceQueue()
          },
          onSkipToNext: () => {
            advanceQueue()
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
      {!inNativeApp && <audio ref={audioRef} />}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          top: 120,
          left: 10,
          height: '100%',
          width: 'calc(50vw - 20px)',
          backgroundColor: 'white',
          color: 'black',
          overflow: 'hidden',
        }}
      >
        <pre style={{ fontSize: 10 }}>
          {(() => {
            const { queue, player: _, ...context } = state.context
            return JSON.stringify(
              {
                state: state.value.toString(),
                activePlayerItem: {
                  id: activePlayerItem?.id,
                  title: activePlayerItem?.document.meta.title,
                  initialPosition:
                    activePlayerItem?.document.meta.audioSource.userProgress
                      ?.secs,
                },
                activeTrack: audioQueue?.find(
                  (i) => i.id === context.currentTrack?.id,
                )?.document.meta.title,
                queue: queue?.map((i) => {
                  const queueItem = audioQueue?.find((j) => i.id === j.id)
                  if (!queueItem) return null
                  return {
                    id: i.id,
                    title: queueItem.document.meta.title,
                    initialPosition:
                      queueItem.document.meta.audioSource.userProgress?.secs,
                  }
                }),
                ...context,
              },
              null,
              2,
            )
          })()}
        </pre>
        <button
          onClick={() => {
            console.log('Audio Controller: log snapshot', state.toJSON())
          }}
        >
          Log snapshot
        </button>
      </div>
    </>
  )
}

export default AudioPlayerController
