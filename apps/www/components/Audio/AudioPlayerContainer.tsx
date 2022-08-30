import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { useAudioContext } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent } from './types/AudioEvent'
import AppMessageEventEmitter from '../../lib/react-native/AppMessageEventEmitter'
import notifyApp from '../../lib/react-native/NotifyApp'
import { AudioPlayerItem } from './types/AudioPlayerItem'
import { PlaylistItemFragment } from './graphql/PlaylistItemGQLFragment'

const DEFAULT_SYNC_INTERVAL = 500 // in ms
const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 30
const SKIP_BACKWARD_TIME = 10

export type AudioPlayerProps = {
  mediaRef: RefObject<HTMLAudioElement>
  activePlayerItem: AudioPlayerItem | null
  queue: PlaylistItemFragment[]
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

const AudioPlayerContainer = ({ children }: AudioPlayerContainerProps) => {
  const { inNativeApp } = useInNativeApp()
  const {
    activePlayerItem,
    queue,
    onCloseAudioPlayer,
    autoPlayActive,
    audioPlayerVisible,
  } = useAudioContext()
  const [trackedPlayerItem, setTrackedPlayerItem] =
    useState<AudioPlayerItem | null>(null)
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)
  const [buffered, setBuffered] = useState<TimeRanges>(null)

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null)

  // TODO: fetch audio progress from media progress

  const syncState = (state?: AudioPlayerState) => {
    if (inNativeApp && state) {
      // Sync via postmessage
      setCurrentTime(state.currentTime)
      setDuration(state.duration)
      setPlaybackRate(state.playRate)
      setIsPlaying(state.isPlaying)
      setIsLoading(state.isLoading)
      return
    } else if (mediaRef.current) {
      const audioElem = mediaRef.current
      setCurrentTime(audioElem.currentTime)
      setDuration(audioElem.duration)
      setPlaybackRate(audioElem.playbackRate)
      setIsPlaying(!audioElem.paused)
      setBuffered(audioElem.buffered)
      return
    }
    throw new Error('no audio state to sync')
  }

  const onCanPlay = () => {
    console.log('onCanPlay')
    setIsLoading(false)
    syncState()
    if (!isPlaying && autoPlayActive && !hasAutoPlayed) {
      setHasAutoPlayed(true)
      onPlay()
    }
  }

  const onPlay = (force?: true) => {
    if (!activePlayerItem || (isPlaying && !force)) return
    console.log('onPlay')
    if (inNativeApp) {
      notifyApp(AudioEvent.PLAY, {
        audioSource: activePlayerItem.meta.audioSource,
      })
    } else if (mediaRef.current) {
      mediaRef.current.play()
      syncState()
    }
  }

  const onPause = () => {
    if (!activePlayerItem || !isPlaying) return
    if (inNativeApp) {
      notifyApp(AudioEvent.PAUSE)
    } else if (mediaRef.current) {
      mediaRef.current.pause()
      syncState()
    }
  }

  const onStop = () => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.STOP)
    } else if (mediaRef.current) {
      mediaRef.current.pause()
      mediaRef.current.currentTime = 0
      syncState()
    }
    setHasAutoPlayed(false)
    onCloseAudioPlayer()
  }

  const onSeek = (progress: number) => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.SEEK, progress * duration)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime = progress * duration
      syncState()
    }
  }

  const onForward = () => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.FORWARD, SKIP_FORWARD_TIME)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime += SKIP_FORWARD_TIME
      syncState()
    }
  }

  const onBackward = () => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime -= SKIP_BACKWARD_TIME
      syncState()
    }
  }

  const onPlaybackRateChange = (value: number) => {
    if (!activePlayerItem) return
    if (inNativeApp) {
      notifyApp(AudioEvent.PLAYBACK_RATE, value)
    } else {
      mediaRef.current.playbackRate = value
      syncState()
    }
    setPlaybackRate(value)
  }

  useEffect(() => {
    // Add a listener for the event emitted by the native app
    if (inNativeApp) {
      AppMessageEventEmitter.addListener(AudioEvent.SYNC, syncState)
      return () => {
        AppMessageEventEmitter.removeListener(AudioEvent.SYNC, syncState)
      }
    }

    // Update the internal state based on the audio element every 500ms
    if (isPlaying && mediaRef.current) {
      const interval = setInterval(() => {
        syncState()
      }, Math.min(DEFAULT_SYNC_INTERVAL / playbackRate, 1000))
      return () => clearInterval(interval)
    }

    if (!isPlaying) return

    throw new Error('no audio state to sync')
  }, [syncState, isPlaying, playbackRate]) // adapt sync-interval to playbackRate

  // Update the local state if a new audio-state is provided
  useEffect(() => {
    if (activePlayerItem === trackedPlayerItem) return
    console.log('new audio state', activePlayerItem)
    setHasAutoPlayed(false) // reset autoplay
    setTrackedPlayerItem(activePlayerItem)
    setIsLoading(true)
    if (inNativeApp) {
      // TODO: check if required logic here is already handled by sync
      // throw new Error('not implemented useEffect')
    } else if (mediaRef.current) {
      mediaRef.current.load()
    }
    onPlay(true)
  }, [activePlayerItem, trackedPlayerItem])

  return (
    <div>
      {audioPlayerVisible &&
        children({
          mediaRef,
          activePlayerItem,
          queue,
          autoPlay: autoPlayActive,
          isLoading,
          isPlaying,
          isSeeking: false,
          currentTime: currentTime,
          duration: duration,
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
          },
          buffered,
        })}
    </div>
  )
}

export default AudioPlayerContainer
