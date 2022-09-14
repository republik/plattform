import React from 'react'
import { css } from 'glamor'
import {
  IconButton,
  Spinner,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  ExpandMoreIcon,
  mediaQueries,
} from '@project-r/styleguide'
import { AudioPlayerProps } from './shared'
import Scrubber from './ui/Scrubber'
import PlaybackRateControl from './controls/PlaybackRateControl'
import CurrentlyPlaying from './ui/CurrentlyPlaying'
import Queue from './ui/Queue'
import AudioControl, { AudioControlProps } from './ui/AudioControl'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    '& > *': {
      userSelect: 'none',
    },
    // maxHeight: '80vh',
    [mediaQueries.mUp]: {
      // maxHeight: '600px',
      padding: 24,
    },
  }),
  currentPlaying: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }),
  spinner: css({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
  }),
  controls: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  bottomActions: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }),
}

type ExpandedAudioPlayerProps = {
  handleMinimize: () => void
  handleClose: () => void
} & AudioControlProps &
  Omit<AudioPlayerProps, 'actions'>

const ExpandedAudioPlayer = ({
  t,
  activeItem,
  queuedItems,
  currentTime = 0,
  duration = 0,
  playbackRate,
  isPlaying,
  isLoading,
  buffered,
  handleMinimize,
  handleToggle,
  handleSeek,
  handleForward,
  handleBackward,
  handlePlaybackRateChange,
}: ExpandedAudioPlayerProps) => {
  return (
    <div {...styles.root}>
      <div {...styles.currentPlaying}>
        <CurrentlyPlaying t={t} item={activeItem} />
        <div {...styles.controls}>
          <AudioControl
            handleToggle={handleToggle}
            handleSeek={handleSeek}
            handleForward={handleForward}
            handleBackward={handleBackward}
            handlePlaybackRateChange={handlePlaybackRateChange}
            isPlaying={isPlaying}
            isLoading={isLoading}
            playbackRate={playbackRate}
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
          />
        </div>
      </div>
      {queuedItems && queuedItems.length > 0 && (
        <Queue t={t} activeItem={activeItem} items={queuedItems} />
      )}
      <div {...styles.bottomActions}>
        <div
          style={{
            flex: 1,
            display: 'inline-flex',
            justifyContent: 'flex-start',
          }}
        >
          <span>Share</span>
        </div>
        <div style={{ flex: 2 }}>
          <PlaybackRateControl
            playbackRate={playbackRate}
            setPlaybackRate={handlePlaybackRateChange}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'inline-flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton
            Icon={ExpandMoreIcon}
            size={32}
            style={{ marginRight: 0 }}
            onClick={handleMinimize}
          />
        </div>
      </div>
    </div>
  )
}

export default ExpandedAudioPlayer
