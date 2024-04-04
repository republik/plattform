import { timeFormat } from 'd3-time-format'
import { AudioQueueItem } from '../types/AudioPlayerItem'

type AudioPlayerActions = {
  onPlay: () => void
  onPause: () => void
  onSeek: (progress: number) => void
  onForward: () => void
  onBackward: () => void
  onClose: () => void
  onPlaybackRateChange: (value: number) => void
}

export type AudioPlayerProps = {
  activeItem: AudioQueueItem
  queuedItems: AudioQueueItem[]
  isPlaying?: boolean
  isLoading?: boolean
  currentTime?: number
  duration?: number
  playbackRate: number
  buffered?: TimeRanges
  actions: AudioPlayerActions
  t: any
  hasError?: boolean
}

export const formatMinutes = (time: number) => Math.floor(time / 60)
export const formatSeconds = (time: number) => Math.floor(time % 60)

export const renderTime = (time) => {
  const minutes = formatMinutes(time || 0)
  const seconds = formatSeconds(time || 0)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export const dateFormatter = timeFormat('%d.%m.%y')

export const FALLBACK_IMG_SRC = '/static/android-chrome-512x512.png'
