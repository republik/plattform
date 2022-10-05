import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { useAudioContext, useAudioContextEvent } from './AudioProvider'
import { NativeAppHelpers, useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent } from './types/AudioEvent'
import notifyApp from '../../lib/react-native/NotifyApp'
import useAudioQueue from './hooks/useAudioQueue'
import { AudioQueueItem } from './graphql/AudioQueueHooks'
import useNativeAppEvent from '../../lib/react-native/useNativeAppEvent'
import { useMediaProgress } from './MediaProgress'
import useInterval from '../../lib/hooks/useInterval'
import { reportError } from '../../lib/errors'
import hasQueueChanged from './helpers/hasQueueChanged'

const DEFAULT_SYNC_INTERVAL = 500 // in ms
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
  mediaRef: RefObject<HTMLAudioElement>
  activeItem: AudioQueueItem | null
  queue: AudioQueueItem[]
  autoPlay?: boolean
  playbackRate: number
  currentTime: number
  duration: number
  isPlaying: boolean
  isLoading: boolean
  isSeeking: boolean
  actions: {
    onCanPlay: () => void
    onPlay: () => void
    onPause: () => void
    onStop: () => void
    onSeek: (progress: number) => void
    onForward: () => void
    onBackward: () => void
    onClose: () => void
    onPlaybackRateChange: (value: number) => void
    onEnded: () => void
    onError: () => void
    onSkipToNext: () => void
  }
  buffered: TimeRanges
}

type AudioPlayerState = {
  playerState: NativeAudioPlayerState
  currentTime: number
  duration: number
  playRate: number
  isPlaying?: boolean
  isLoading?: boolean
}

type AudioPlayerContainerProps = {
  children: (props: AudioPlayerProps) => ReactNode
}

let initialized = false

const AudioPlayerContainer = ({ children }: AudioPlayerContainerProps) => {
  const { inNativeApp } = useInNativeApp()
  const { setAudioPlayerVisible } = useAudioContext()
  const { audioQueue, audioQueueIsLoading, removeAudioQueueItem } =
    useAudioQueue()
  const { saveMediaProgress } = useMediaProgress()

  const mediaRef = useRef<HTMLAudioElement>(null)
  const trackedPlayerItem = useRef<AudioQueueItem>(null)
  const trackedQueue = useRef<AudioQueueItem[]>(null)

  const [activePlayerItem, setActivePlayerItem] =
    useState<AudioQueueItem | null>(null)
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false)
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState<TimeRanges>(null)
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

  const handleError = (error: Error | MediaError | string) => {
    if (typeof error === 'string') {
      reportError('handle audio-error', error)
    } else {
      reportError(
        'handle audio-error',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      )
    }
  }

  const saveActiveItemProgress = useCallback(
    async (forcedState?: { currentTime?: number; isPlaying?: boolean }) => {
      const { mediaId } = activePlayerItem?.document.meta?.audioSource ?? {}
      saveMediaProgress(
        mediaId,
        forcedState?.currentTime ?? currentTime,
        forcedState?.isPlaying ?? isPlaying,
      )
    },
    [activePlayerItem, currentTime, isPlaying, saveMediaProgress],
  )

  const syncWithNativeApp = (state: AudioPlayerState) => {
    if (!inNativeApp) return
    // Don't update the currentTime & duration
    // if the native player wasn't yet able to load the media
    // TODO: find out why the track-player sometimes provides currentTime = 0
    // when state is ready
    if (
      ![
        NativeAudioPlayerState.None,
        NativeAudioPlayerState.Connecting,
      ].includes(state.playerState)
    ) {
      setDuration(state.duration)
      setCurrentTime(state.currentTime)
    }
    setPlaybackRate(state.playRate)
    setIsPlaying(
      state?.isPlaying ||
        [
          NativeAudioPlayerState.Playing,
          NativeAudioPlayerState.Buffering,
        ].includes(state.playerState),
    )
    setIsLoading(
      state?.isLoading ||
        [NativeAudioPlayerState.Connecting].includes(state.playerState),
    )
  }

  const syncWithMediaElement = () => {
    try {
      if (!mediaRef.current) return
      const audioElem = mediaRef.current
      setCurrentTime(audioElem.currentTime)
      setDuration(audioElem.duration)
      setPlaybackRate(audioElem.playbackRate)
      setIsPlaying(!audioElem.paused)
      setIsLoading(audioElem.readyState < 1)
      setBuffered(audioElem.buffered)
    } catch (error) {
      handleError(error)
    }
  }

  const onCanPlay = async () => {
    try {
      setIsLoading(false)
      syncWithMediaElement()

      if (activePlayerItem?.id !== trackedPlayerItem?.current?.id) {
        trackedPlayerItem.current = activePlayerItem

        const { userProgress, durationMs } =
          activePlayerItem.document?.meta.audioSource ?? {}
        const duration = durationMs / 1000
        console.log('Available userProgress is ', userProgress?.secs ?? 0)
        // Only load the userProgress if given and smaller within 2 seconds of the duration
        if (
          mediaRef.current &&
          userProgress &&
          (!duration || userProgress.secs + 2 < duration)
        ) {
          setCurrentTime(userProgress.secs)
          mediaRef.current.currentTime = userProgress.secs
        }
      }

      if (!activePlayerItem) return

      if (!isPlaying && shouldAutoPlay && !hasAutoPlayed) {
        console.log('triggering onPlay via onCanPlay')
        setHasAutoPlayed(true)
        await onPlay()
      }
    } catch (error) {
      handleError(error)
    }
  }

  const onPlay = async () => {
    try {
      if (inNativeApp) {
        // handle edge case when the track-player queue is empty
        // the previously played item must therefor be readded to the queue
        if (audioQueue.length === 0 && activePlayerItem) {
          // TODO: find a way to re-add the last played item to the queue
          // so that the track-player can start playing it again
        }
        notifyApp(AudioEvent.PLAY)
      } else if (mediaRef.current) {
        mediaRef.current.playbackRate = playbackRate
        mediaRef.current.play()
        syncWithMediaElement()
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
      } else if (mediaRef.current) {
        mediaRef.current.pause()
        syncWithMediaElement()
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
      if (!activePlayerItem) return
      if (inNativeApp) {
        notifyApp(AudioEvent.STOP)
      } else if (mediaRef.current) {
        mediaRef.current.pause()
        mediaRef.current.currentTime = 0
        syncWithMediaElement()
      }
      setHasAutoPlayed(false)
      setIsVisible(false)
      initialized = false
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
      } else if (mediaRef.current) {
        mediaRef.current.currentTime = progress * duration
        syncWithMediaElement()
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
      } else if (mediaRef.current) {
        mediaRef.current.currentTime += SKIP_FORWARD_TIME
        syncWithMediaElement()
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
      } else if (mediaRef.current) {
        mediaRef.current.currentTime -= SKIP_BACKWARD_TIME
        syncWithMediaElement()
      }
      await saveActiveItemProgress({
        currentTime: updatedCurrentTime,
        isPlaying: false,
      })
    } catch (error) {
      handleError(error)
    }
  }

  const onPlaybackRateChange = (value: number) => {
    try {
      if (!activePlayerItem) return
      if (inNativeApp) {
        notifyApp(AudioEvent.PLAYBACK_RATE, value)
      } else {
        mediaRef.current.playbackRate = value
        syncWithMediaElement()
      }
      setPlaybackRate(value)
    } catch (error) {
      handleError(error)
    }
  }

  // Handle track ending on media element
  const onQueueAdvance = async () => {
    if (!activePlayerItem) return
    console.log('onQueueAdvance')
    try {
      const { data } = await removeAudioQueueItem({
        variables: {
          id: activePlayerItem.id,
        },
      })
      if (data.audioQueueItems.length > 0) {
        setShouldAutoPlay(true)
        const nextUp = data.audioQueueItems[0]
        setActivePlayerItem(nextUp)
      } else {
        console.log('onQueueAdvance: no more items in queue')
        setShouldAutoPlay(false)
        setActivePlayerItem(null)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const playQueue = async () => {
    try {
      if (!audioQueue || audioQueue.length === 0) {
        console.log('playQueue: no audioQueue', audioQueue)
        return
      }
      console.log('playQueue', {
        audioQueue,
        activePlayerItem,
        trackedPlayerItem,
      })
      const nextUp = audioQueue[0]
      setActivePlayerItem(nextUp)
      setIsVisible(true)
      await onPlay()
    } catch (error) {
      handleError(error)
    }
  }

  const onError = () => {
    if (mediaRef.current && mediaRef.current.error) {
      const error = mediaRef.current.error
      handleError(
        new Error(
          JSON.stringify(
            {
              message: error.message,
              code: error.code,
              MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
              MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
              MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
            },
            null,
            2,
          ),
        ),
      )
      // TODO: handle error and show visually
    }
    // TODO: look into best way for the track-player to handle errors
  }

  useInterval(
    saveActiveItemProgress,
    isPlaying ? SAVE_MEDIA_PROGRESS_INTERVAL : null,
  )

  // Reset media-element if new source is provided
  useEffect(() => {
    if (activePlayerItem?.id === trackedPlayerItem?.current?.id) {
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
  }, [activePlayerItem, trackedPlayerItem, setIsLoading, setHasAutoPlayed])

  // Sync web-ui with web media-element
  useEffect(() => {
    // Update the internal state based on the audio element every 500ms
    if (isPlaying && mediaRef.current) {
      const interval = setInterval(() => {
        syncWithMediaElement()
      }, Math.min(DEFAULT_SYNC_INTERVAL / playbackRate, 1000))
      return () => clearInterval(interval)
    }
  }, [syncWithMediaElement, isPlaying, playbackRate])

  // Handle an item being pushed to the front of the audio-queue
  useEffect(() => {
    if (
      audioQueue &&
      audioQueue.length > 0 &&
      (!activePlayerItem ||
        activePlayerItem.document.id !== audioQueue[0].document.id)
    ) {
      const nextActivePlayerItem = audioQueue[0]
      const alreadyHadActivePlayerItem = !!activePlayerItem
      setActivePlayerItem(nextActivePlayerItem)
      setShouldAutoPlay(true)
      setHasAutoPlayed(false)
      setIsPlaying(false)

      // Provide the inital duration and progress for the ui
      // as a fallback until the media was loaded
      // to prevent the ui from showing 0:00

      const audioSource = nextActivePlayerItem.document?.meta?.audioSource
      setDuration(audioSource.durationMs / 1000)
      if (audioSource?.userProgress) {
        setCurrentTime(audioSource.userProgress.secs)
      }

      if (mediaRef.current && alreadyHadActivePlayerItem) {
        mediaRef.current.load()
      }
    }
  }, [activePlayerItem, trackedPlayerItem, audioQueue])

  // Sync the queue with the native-app and reopen the player if queue changed
  // while it was closed
  useEffect(() => {
    if (
      inNativeApp &&
      audioQueue &&
      hasQueueChanged(trackedQueue?.current, audioQueue)
    ) {
      notifyApp(AudioEvent.QUEUE_UPDATE, audioQueue)
    }
    //
    if (
      audioQueue &&
      audioQueue.length > 0 &&
      !isVisible &&
      hasQueueChanged(trackedQueue?.current, audioQueue)
    ) {
      setIsVisible(true)
    }
    trackedQueue.current = audioQueue
  }, [inNativeApp, audioQueue, isVisible])

  // Open up the audio-player once the app has started if the queue is not empty
  useEffect(() => {
    if (audioQueueIsLoading || audioQueue?.length === 0 || initialized) {
      return
    }
    if (audioQueue.length > 0) {
      const nextUp = audioQueue[0]
      setActivePlayerItem(nextUp)
      setShouldAutoPlay(false)
      setIsVisible(true)
    }
    initialized = true
  }, [audioQueue])

  // Sync audio-player visible with audio-context
  useEffect(() => {
    setAudioPlayerVisible(isVisible)
  }, [isVisible])

  useAudioContextEvent<void>('togglePlayer', playQueue)
  useNativeAppEvent(AudioEvent.SYNC, syncWithNativeApp)
  useNativeAppEvent(AudioEvent.QUEUE_ADVANCE, onQueueAdvance)
  useNativeAppEvent(AudioEvent.ERROR, handleError)

  return (
    <>
      {children({
        isVisible,
        mediaRef,
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
            : activePlayerItem?.document?.meta?.audioSource?.durationMs /
                1000 || 0,
        playbackRate,
        actions: {
          onCanPlay,
          onPlay,
          onPause,
          onStop,
          onSeek,
          onForward,
          onBackward,
          onClose: onStop,
          onPlaybackRateChange,
          onEnded: onQueueAdvance,
          onError,
          onSkipToNext: onQueueAdvance,
        },
        buffered,
      })}
    </>
  )
}

export default AudioPlayerContainer
