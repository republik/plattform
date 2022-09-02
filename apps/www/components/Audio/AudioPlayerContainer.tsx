import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { AudioEventEmitter } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent } from './types/AudioEvent'
import AppMessageEventEmitter from '../../lib/react-native/AppMessageEventEmitter'
import notifyApp from '../../lib/react-native/NotifyApp'
import useAudioQueue from './hooks/useAudioQueue'
import { AudioQueueItem } from './graphql/AudioQueueHooks'
import useNativeAppEvent from '../../lib/react-native/useNativeAppEvent'

const DEFAULT_SYNC_INTERVAL = 500 // in ms
const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 30
const SKIP_BACKWARD_TIME = 10

export type AudioPlayerProps = {
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
  }
  buffered: TimeRanges
}

type AudioPlayerState = {
  currentTime: number
  duration: number
  playRate: number
  isPlaying: boolean
  isLoading: boolean
}

type AudioPlayerContainerProps = {
  children: (props: AudioPlayerProps) => ReactNode
}

let initialized = false

const AudioPlayerContainer = ({ children }: AudioPlayerContainerProps) => {
  const { inNativeApp } = useInNativeApp()
  const {
    audioQueue,
    audioQueueIsLoading,
    addAudioQueueItem,
    removeAudioQueueItem,
  } = useAudioQueue()

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

  const syncWithNativeApp = (state: AudioPlayerState) => {
    if (!inNativeApp) return
    // Sync via postmessage
    setCurrentTime(state.currentTime)
    setDuration(state.duration)
    setPlaybackRate(state.playRate)
    setIsPlaying(state.isPlaying)
    setIsLoading(state.isLoading)
  }

  const syncWithMediaElement = () => {
    if (!mediaRef.current) return
    const audioElem = mediaRef.current
    setCurrentTime(audioElem.currentTime)
    setDuration(audioElem.duration)
    setPlaybackRate(audioElem.playbackRate)
    setIsPlaying(!audioElem.paused)
    setIsLoading(audioElem.readyState < 1)
    setBuffered(audioElem.buffered)
  }

  const onCanPlay = () => {
    setIsLoading(false)
    syncWithMediaElement()
    console.log('AudioPlayerContainer: onCanPlay', {
      isPlaying,
      shouldAutoPlay,
      hasAutoPlayed,
    })
    if (!isPlaying && shouldAutoPlay && !hasAutoPlayed) {
      console.log('triggering onPlay via onCanPlay')
      setHasAutoPlayed(true)
      onStart()
    }
  }

  const onStart = () => {
    if (!activePlayerItem || isPlaying) {
      console.log('onPlay: no activePlayerItem or isPlaying')
      return
    }

    if (activePlayerItem !== trackedPlayerItem.current) {
      trackedPlayerItem.current = activePlayerItem
    }

    if (inNativeApp) {
      console.trace('onPlay: inNativeApp', JSON.stringify(activePlayerItem))
      notifyApp(AudioEvent.PLAY, {
        audioSource: activePlayerItem.document.meta.audioSource,
      })
    } else if (mediaRef.current) {
      console.log('calling play on web-mediaRef')
      mediaRef.current.playbackRate = playbackRate
      mediaRef.current.play()
      syncWithMediaElement()
    }
  }

  const onPlay = async () => {
    if (inNativeApp) {
      // handle edge case when the track-player queue is empty
      // the previously played item must therefor be readded to the queue
      if (audioQueue.length === 0 && activePlayerItem) {
        // TODO: find a way to readd the last played item to the queue
        // so that the track-player can start playing it again
      }
      console.trace('onPlay: inNativeApp', JSON.stringify(activePlayerItem))
      notifyApp(AudioEvent.PLAY)
    } else if (mediaRef.current) {
      console.log('calling play on web-mediaRef')
      mediaRef.current.playbackRate = playbackRate
      mediaRef.current.play()
    }
  }

  const onPause = () => {
    if (!activePlayerItem || !isPlaying) return
    if (inNativeApp) {
      notifyApp(AudioEvent.PAUSE)
    } else if (mediaRef.current) {
      mediaRef.current.pause()
      syncWithMediaElement()
    }
  }

  const onStop = () => {
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
  }

  const onSeek = (progress: number) => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.SEEK, progress * duration)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime = progress * duration
      syncWithMediaElement()
    }
  }

  const onForward = () => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.FORWARD, SKIP_FORWARD_TIME)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime += SKIP_FORWARD_TIME
      syncWithMediaElement()
    }
  }

  const onBackward = () => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime -= SKIP_BACKWARD_TIME
      syncWithMediaElement()
    }
  }

  const onPlaybackRateChange = (value: number) => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.PLAYBACK_RATE, value)
    } else {
      mediaRef.current.playbackRate = value
      syncWithMediaElement()
    }
    setPlaybackRate(value)
  }

  // Handle track ending on media element
  const onQueueAdvance = async () => {
    if (!activePlayerItem) return
    try {
      const { data } = await removeAudioQueueItem({
        variables: {
          id: activePlayerItem.id,
        },
      })
      if (data.audioQueueItems.length > 0) {
        setActivePlayerItem(data.audioQueueItems[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const playQueue = () => {
    if (!audioQueue || audioQueue.length === 0) {
      console.log('playQueue: no audioQueue', audioQueue)
      return
    }
    console.log('playQueue', {
      audioQueue,
      activePlayerItem,
      trackedPlayerItem,
    })
    const nextItem = audioQueue[0]
    setActivePlayerItem(nextItem)
    setIsVisible(true)
    onStart()
  }

  // Listen for togglePlayer events from the AudioContext
  useEffect(() => {
    AudioEventEmitter.addListener('togglePlayer', playQueue)
    return () => {
      AudioEventEmitter.removeListener('togglePlayer', playQueue)
    }
  }, [setActivePlayerItem, setShouldAutoPlay, playQueue])

  // Update the local state if a new audio-state is provided
  useEffect(() => {
    if (activePlayerItem === trackedPlayerItem?.current) return
    setIsLoading(true)
    if (inNativeApp) {
      // TODO: check if required logic here is already handled by sync
      // throw new Error('not implemented useEffect')
    } else if (
      mediaRef.current &&
      // If no data could be retrieved so far, manually trigger load
      mediaRef.current.readyState === 0
    ) {
      mediaRef.current.load()
    }
    trackedPlayerItem.current = activePlayerItem
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0 // TODO: use saved media-progress
    }
  }, [
    activePlayerItem,
    trackedPlayerItem,
    setIsLoading,
    setHasAutoPlayed,
    onStart,
  ])

  // UI & Container state synchronisation
  useEffect(() => {
    // Update the internal state based on the audio element every 500ms
    if (isPlaying && mediaRef.current) {
      const interval = setInterval(() => {
        syncWithMediaElement()
      }, Math.min(DEFAULT_SYNC_INTERVAL / playbackRate, 1000))
      return () => clearInterval(interval)
    }
  }, [syncWithMediaElement, isPlaying, playbackRate]) // adapt sync-interval to playbackRate

  useNativeAppEvent(AudioEvent.SYNC, syncWithNativeApp)
  useNativeAppEvent(AudioEvent.QUEUE_ADVANCE, onQueueAdvance)

  // Handle an item being pushed to the front of the audio-queue
  useEffect(() => {
    if (
      audioQueue &&
      audioQueue.length > 0 &&
      (!activePlayerItem ||
        activePlayerItem.document.id !== audioQueue[0].document.id)
    ) {
      setActivePlayerItem(audioQueue[0])
      trackedPlayerItem.current = null
    }
  }, [activePlayerItem, trackedPlayerItem, audioQueue])

  // Sync the queue with the app
  useEffect(() => {
    if (inNativeApp && audioQueue && audioQueue !== trackedQueue.current) {
      notifyApp(AudioEvent.QUEUE_UPDATE, audioQueue)
      trackedQueue.current = audioQueue
    }
  }, [inNativeApp, audioQueue])

  // Open up the audio-player once the app has started if the
  // audio-queue is not empty
  useEffect(() => {
    if (audioQueueIsLoading || audioQueue?.length === 0 || initialized) {
      return
    }
    if (audioQueue.length > 0) {
      const item = audioQueue[0]
      setActivePlayerItem(item)
      trackedPlayerItem.current = item
      setShouldAutoPlay(false)
      setIsVisible(true)
    }
    initialized = true
  }, [audioQueue])

  if (!activePlayerItem) return null

  return (
    <div>
      {isVisible &&
        children({
          mediaRef,
          activeItem: activePlayerItem,
          queue: audioQueue,
          autoPlay: shouldAutoPlay,
          isLoading,
          isPlaying,
          isSeeking: false,
          currentTime: currentTime,
          duration:
            duration !== 0
              ? duration
              : activePlayerItem.document.meta.audioSource.durationMs / 1000,
          playbackRate,
          actions: {
            onCanPlay,
            onPlay:
              activePlayerItem === trackedPlayerItem.current ? onPlay : onStart,
            onPause,
            onStop,
            onSeek,
            onForward,
            onBackward,
            onClose: onStop,
            onPlaybackRateChange,
            onEnded: onQueueAdvance,
          },
          buffered,
        })}
    </div>
  )
}

export default AudioPlayerContainer
