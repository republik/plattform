import { css } from '@republik/theme/css'
import { timeFormat } from 'd3-time-format'
import { AudioQueueItem } from '../types/AudioQueueItem'

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


/**
 * Cover art in the player is always square. The slot pins its rendered size
 * with an inline `style`, overriding `TeaserImage`'s own full-width base; the
 * crop Sanity returns is square already, so `objectFit` only guards against
 * an image that isn't.
 */
export const audioCoverStyle = css({
  flexShrink: 0,
  objectFit: 'cover',
})
