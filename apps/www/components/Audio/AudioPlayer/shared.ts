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
  title: string
  isPlaying?: boolean
  isLoading?: boolean
  //
  currentTime?: number
  duration?: number
  playbackRate: number
  buffered?: TimeRanges
  //
  actions: AudioPlayerActions
  t: any
  sourcePath?: string
}

export const renderTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
