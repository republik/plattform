import { useRef } from 'react'
import { usePlaybackRate } from '../../lib/playbackRate'
import { useAudioContext } from './AudioProvider'

const DEFAULT_PLAYBACK_RATE = 1

const AudioPlayerController = ({ audio }) => {
  const _ = useAudioContext()
  const audioRef = useRef()
  const [playbackRate, setPlaybackRate] = usePlaybackRate(DEFAULT_PLAYBACK_RATE)

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

  return null
}

export default AudioPlayerController
