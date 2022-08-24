import React, { useState } from 'react'
import { AudioPlayerProps } from './shared'
import MiniAudioPlayer from './MiniAudioPlayer'
import ExpandedAudioPlayer from './ExpandedAudioPlayer'

const AudioPlayer = ({
  t,
  title,
  playbackRate,
  sourcePath,
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  buffered,
  actions,
}: AudioPlayerProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleAudioPlayer = () => {
    if (isPlaying) {
      actions.onPause()
    } else {
      actions.onPlay()
    }
  }

  if (isExpanded) {
    return (
      <ExpandedAudioPlayer
        t={t}
        title={title}
        playbackRate={playbackRate}
        sourcePath={sourcePath}
        isPlaying={isPlaying}
        isLoading={isLoading}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        handleMinimize={() => setIsExpanded(false)}
        handleToggle={toggleAudioPlayer}
        handleSeek={actions.onSeek}
        handleClose={actions.onClose}
        handleForward={actions.onForward}
        handleBackward={actions.onBackward}
        handlePlaybackRateChange={actions.onPlaybackRateChange}
      />
    )
  }

  return (
    <MiniAudioPlayer
      t={t}
      title={title}
      sourcePath={sourcePath}
      isPlaying={isPlaying}
      isLoading={isLoading}
      currentTime={currentTime}
      duration={duration}
      buffered={buffered}
      handleExpand={() => setIsExpanded(true)}
      handleToggle={toggleAudioPlayer}
      handleSeek={actions.onSeek}
      handleClose={actions.onClose}
    />
  )
}

export default AudioPlayer
