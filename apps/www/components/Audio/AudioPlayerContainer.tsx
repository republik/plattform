import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { AudioState, useAudioContext } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent } from './types/AudioEvent'
import AppMessageEventEmitter from '../../lib/react-native/AppMessageEventEmitter'
import notifyApp from '../../lib/react-native/NotifyApp'

const DEFAULT_SYNC_INTERVAL = 500 // in ms
const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 15
const SKIP_BACKWARD_TIME = 10

export type AudioPlayerUIProps = {
  mediaRef: RefObject<HTMLAudioElement>
  audioState: AudioState | null
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
  children: (props: AudioPlayerUIProps) => ReactNode
}

const AudioPlayerContainer = ({ children }: AudioPlayerContainerProps) => {
  const { inNativeApp } = useInNativeApp()
  const { audioState, onCloseAudioPlayer, autoPlayActive, audioPlayerVisible } =
    useAudioContext()
  const [trackedAudioState, setTrackedAudioState] = useState<AudioState | null>(
    null,
  )
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
    if (!audioState || (isPlaying && !force)) return
    console.log('onPlay')
    if (inNativeApp) {
      notifyApp(AudioEvent.PLAY, audioState)
    } else if (mediaRef.current) {
      mediaRef.current.play()
      syncState()
    }
  }

  const onPause = () => {
    if (!audioState || !isPlaying) return
    if (inNativeApp) {
      notifyApp(AudioEvent.PAUSE)
    } else if (mediaRef.current) {
      mediaRef.current.pause()
      syncState()
    }
  }

  const onStop = () => {
    if (!audioState) return
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
    if (!audioState) return
    if (inNativeApp) {
      notifyApp(AudioEvent.SEEK, progress * duration)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime = progress * duration
      syncState()
    }
  }

  const onForward = () => {
    if (!audioState) return
    if (inNativeApp) {
      notifyApp(AudioEvent.FORWARD, SKIP_FORWARD_TIME)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime += SKIP_FORWARD_TIME
      syncState()
    }
  }

  const onBackward = () => {
    if (!audioState) return
    if (inNativeApp) {
      notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
    } else if (mediaRef.current) {
      mediaRef.current.currentTime -= SKIP_BACKWARD_TIME
      syncState()
    }
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
    if (audioState === trackedAudioState) return
    console.log('new audio state', audioState)
    setHasAutoPlayed(false) // reset autoplay
    setTrackedAudioState(audioState)
    setIsLoading(true)
    if (inNativeApp) {
      // TODO: check if required logic here is already handled by sync
      // throw new Error('not implemented useEffect')
    } else if (mediaRef.current) {
      mediaRef.current.load()
    }
    onPlay(true)
  }, [audioState, trackedAudioState])

  return (
    <div>
      {audioPlayerVisible &&
        children({
          mediaRef,
          audioState,
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
          },
          buffered,
        })}
    </div>
  )
}

export default AudioPlayerContainer
