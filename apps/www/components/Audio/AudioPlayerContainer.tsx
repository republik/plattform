import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { AudioState, useAudioContext } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioEvent } from './types/AudioEvent'
import AppMessageEventEmitter from '../../lib/react-native/AppMessageEventEmitter'
import notifyApp from '../../lib/react-native/NotifyApp'

const DEFAULT_PLAYBACK_RATE = 1

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
    onPlay: () => void
    onPause: () => void
    onStop: () => void
    onSeek: (event?: any) => void
    onForward: () => void
    onBackward: () => void
  }
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
  const { audioState, onCloseAudioPlayer } = useAudioContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

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
      return
    }
    throw new Error('no audio state to sync')
  }

  const onPlay = () => {
    if (!audioState || isPlaying) return
    // TODO: start playing
    if (inNativeApp) {
      notifyApp(AudioEvent.PLAY, audioState)
    } else if (audioRef.current) {
      audioRef.current.play().then((x) => setIsPlaying(true))
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

  const onSeek = (event: any) => {
    if (!audioState) return
    console.log('onSeek', event)
    if (inNativeApp) {
      throw new Error('not implemented')
    } else if (audioRef.current) {
      syncState()
    }
  }

  // TODO: auto play if a new track is added and nothing is playing yet.

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
      }, 500)
      return () => clearInterval(interval)
    }

    if (!isPlaying) return

    throw new Error('no audio state to sync')
  }, [syncState, isPlaying])

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
      {children({
        audioRef,
        audioState,
        isLoading,
        isPlaying,
        isSeeking: false,
        currentTime: currentTime,
        duration: duration,
        playbackRate,
        actions: {
          onPlay,
          onPause,
          onStop,
          onSeek,
          onForward: () => {
            throw new Error('not implemented')
          },
          onBackward: () => {
            throw new Error('not implemented')
          },
        },
      })}
    </div>
  )
}

export default AudioPlayerContainer
