import React from 'react'

type AudioPlayerActions = {
  onPlay: () => void
  onPause: () => void
  onSeek: (progress: number) => void
  onForward: () => void
  onBackward: () => void
}

type AudioPlayerProps = {
  isPlaying?: boolean
  //
  currentTime?: number
  duration?: number
  buffered?: TimeRanges[]
  //
  actions: AudioPlayerActions
}

const renderTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const AudioPlayer = ({
  isPlaying,
  currentTime = 0,
  duration = 0,
  buffered,
  actions,
}: AudioPlayerProps) => {
  return (
    <div>
      <div>AudioPlayer</div>
      <div>
        <button onClick={actions.onPlay} disabled={isPlaying}>
          Play
        </button>
        <button onClick={actions.onPause} disabled={!isPlaying}>
          Pause
        </button>
        <div>
          <button onClick={actions.onForward}>forward</button>
        </div>
        <div>
          <button onClick={actions.onBackward}>backward</button>
        </div>
      </div>
      <p>
        {renderTime(currentTime)} / {renderTime(duration)}
      </p>
    </div>
  )
}

export default AudioPlayer
