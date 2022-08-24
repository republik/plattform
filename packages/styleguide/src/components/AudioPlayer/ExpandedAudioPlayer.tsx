import React from 'react'
import { css } from 'glamor'
import { AudioPlayerProps, renderTime } from './shared'
import IconButton from '../IconButton'
import { ForwardIcon, PauseIcon, PlayIcon } from '../Icons'
import Spinner from '../Spinner'
import { MdExpandMore, MdReplay10 } from 'react-icons/md'
import Scrubber from './Scrubber'
import PlaybackRateControl from './controls/PlaybackRateControl'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
  }),
  spinnerWrapper: css({
    position: 'relative',
    width: 42,
    height: 42,
  }),
  actionWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-center',
    alignItems: 'center',
    gap: '1rem',
    margin: '0 auto',
  }),
  bottomActionsWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }),
}

type ExpandedAudioPlayerProps = {
  handleMinimize: () => void
  handleToggle: () => void
  handleSeek: (progress: number) => void
  handleClose: () => void
  handleForward: () => void
  handleBackward: () => void
  handlePlaybackRateChange: (value: number) => void
} & Omit<AudioPlayerProps, 'actions'>

const ExpandedAudioPlayer = ({
  t,
  title,
  sourcePath,
  playbackRate,
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  buffered,
  handleMinimize,
  handleToggle,
  handleSeek,
  handleClose,
  handleForward,
  handleBackward,
  handlePlaybackRateChange,
}: ExpandedAudioPlayerProps) => {
  return (
    <div {...styles.root}>
      <div>queue</div>
      <div>cover</div>
      <div>
        {renderTime(currentTime)} / {renderTime(duration)}
      </div>
      <div>
        <Scrubber
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          showScrubber={false}
          disabled={isLoading}
          onSeek={handleSeek}
        />
      </div>
      <div {...styles.actionWrapper}>
        <IconButton
          size={32}
          fillColorName={'text'}
          onClick={handleBackward}
          Icon={MdReplay10}
          style={{ marginRight: 0 }}
        />
        {isLoading ? (
          <div {...styles.spinnerWrapper}>
            <Spinner size={32} />
          </div>
        ) : (
          <IconButton
            onClick={handleToggle}
            title={t(`styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`)}
            aria-live='assertive'
            Icon={isPlaying ? PauseIcon : PlayIcon}
            size={48}
            fillColorName={'text'}
            style={{ marginRight: 0 }}
          />
        )}
        <IconButton
          size={32}
          fillColorName={'text'}
          onClick={handleForward}
          Icon={ForwardIcon}
          style={{ marginRight: 0 }}
        />
      </div>
      <div {...styles.bottomActionsWrapper}>
        <span>Share</span>
        <PlaybackRateControl
          playbackRate={playbackRate}
          setPlaybackRate={handlePlaybackRateChange}
        />
        <span>
          <IconButton
            Icon={MdExpandMore}
            size={24}
            style={{ marginRight: 0 }}
            onClick={handleMinimize}
          />
        </span>
      </div>
    </div>
  )
}

export default ExpandedAudioPlayer
