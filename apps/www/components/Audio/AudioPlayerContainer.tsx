import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { AudioState, useAudioContext } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent } from './types/AudioEvent'
import AppMessageEventEmitter from '../../lib/react-native/AppMessageEventEmitter'
import notifyApp from '../../lib/react-native/NotifyApp'
import { setLogVerbosity } from '@apollo/client'

const DEFAULT_SYNC_INTERVAL = 500 // in ms
const DEFAULT_PLAYBACK_RATE = 1
const SKIP_FORWARD_TIME = 15
const SKIP_BACKWARD_TIME = 10

export type AudioPlayerUIProps = {
  audioState: AudioState | null
  audioRef: RefObject<HTMLAudioElement>
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
  }
  buffered: TimeRanges
}

type AudioPlayerState = {
  currentTime: number
  duration: number
  playRate: number
  isPlaying: boolean
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

  const audioRef = useRef<HTMLAudioElement>(null)

  const syncState = (state?: AudioPlayerState) => {
    if (inNativeApp && state) {
      // Sync via postmessage
      setCurrentTime(state.currentTime)
      setDuration(state.duration)
      setPlaybackRate(state.playRate)
      setIsPlaying(state.isPlaying)
      return
    } else if (audioRef.current) {
      const audioElem = audioRef.current
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

  const onPlay = () => {
    if (!audioState || isPlaying) return
    // TODO: start playing
    if (inNativeApp) {
      notifyApp(AudioEvent.PLAY, audioState)
    } else if (audioRef.current) {
      audioRef.current.play()
      syncState()
    }
  }

  const onPause = () => {
    if (!audioState || !isPlaying) return
    // TODO: stop playing
    if (inNativeApp) {
      notifyApp(AudioEvent.PAUSE)
    } else if (audioRef.current) {
      audioRef.current.pause()
      syncState()
    }
  }

  const onStop = () => {
    if (!audioState) return
    if (inNativeApp) {
      notifyApp(AudioEvent.STOP)
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      syncState()
    }
    onCloseAudioPlayer()
  }

  const onSeek = (progress: number) => {
    if (!audioState) return
    console.log('onSeek', progress)
    if (inNativeApp) {
      throw new Error('not implemented')
    } else if (audioRef.current) {
      audioRef.current.currentTime = progress * duration
      syncState()
    }
  }

  const onForward = () => {
    if (!audioState) return
    if (inNativeApp) {
      notifyApp(AudioEvent.FORWARD, SKIP_FORWARD_TIME)
    } else if (audioRef.current) {
      audioRef.current.currentTime += SKIP_FORWARD_TIME
      syncState()
    }
  }

  const onBackward = () => {
    if (!audioState) return
    if (inNativeApp) {
      notifyApp(AudioEvent.BACKWARD, SKIP_BACKWARD_TIME)
    } else if (audioRef.current) {
      audioRef.current.currentTime -= SKIP_BACKWARD_TIME
      syncState()
    }
  }

  useEffect(() => {
    // Add a listener for the event emitted by the native app
    if (inNativeApp) {
      // Setup listeneronMessageSync
      AppMessageEventEmitter.addListener(AudioEvent.SYNC, syncState)
      return () => {
        AppMessageEventEmitter.removeListener(AudioEvent.SYNC, syncState)
      }
    }

    // Update the interal state based on the audio element every 500ms
    if (isPlaying && audioRef.current) {
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

    setTrackedAudioState(audioState)
    setIsLoading(true)
    if (inNativeApp) {
      throw new Error('not implemented')
    } else if (audioRef.current) {
      audioRef.current.load()
    }
  }, [audioState, trackedAudioState])

  // WEB-TASKS
  // --- Effects ---

  // TODO: save media-progress periodically -> interval
  // TODO: save media-progress onPause -> callback
  // TODO: save media-progress onClose -> callback
  // --- MediaSession ---
  // TODO: sync track with media-session
  // TODO: sync position with media-session
  // TODO: sync playbackRate with media-session
  // TODO: handle play + pause from media-session -> play/pause
  // TODO: handle forward + backward from media-session -> forward/backward

  // APP-TASKS
  // --- PostMessage ---
  // TODO: postMessage to app if track changes
  // TODO: postMessage to app if playbackRate changes
  // TODO: postMessage to app if play in web-ui
  // TODO: postmessage to app if pause in web-ui
  // TODO: postMessage to app if seekTo in web-ui (also handle seekForward + seekBackward)
  // TODO: postMessage to app if close in web-ui
  // --- onMessageSync listeners
  // TODO: onMessageSync to web-ui if play in app
  // TODO: onMessageSync to web-ui if pause in app
  // TODO: onMessageSync to web-ui if seekTo in app
  // TODO: onMessageSync to web-ui if seekForward in app
  // TODO: onMessageSync to web-ui if seekBackward in app

  return (
    <div>
      {audioPlayerVisible &&
        children({
          audioRef,
          audioState,
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
          },
          buffered,
        })}
    </div>
  )
}

export default AudioPlayerContainer
