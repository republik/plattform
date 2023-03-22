import React from 'react'
import { css } from 'glamor'
import {
  IconButton,
  Spinner,
  mediaQueries,
} from '@project-r/styleguide'
import { useTranslation } from '../../../../lib/withT'
import { AudioPlayerProps } from '../shared'
import PlaybackRateControl from './PlaybackRateControl'
import Scrubber from './Scrubber'
import { IconForward, IconPause, IconPlay, IconReplay, IconSkipNext } from '@republik/icons'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  controlWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  }),
  mainControls: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-center',
    alignItems: 'center',
    gap: 16,
    [mediaQueries.sDown]: {
      gap: 8,
    },
  }),
  spinner: css({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    [mediaQueries.sDown]: {
      width: 48,
      height: 48,
    },
  }),
}

export type AudioControlProps = {
  handleToggle: () => void
  handleSeek: (progress: number) => void
  handleForward: () => void
  handleBackward: () => void
  handleSkipToNext: () => void
  handlePlaybackRateChange: (value: number) => void
} & Pick<
  AudioPlayerProps,
  | 'isPlaying'
  | 'isLoading'
  | 'playbackRate'
  | 'currentTime'
  | 'duration'
  | 'buffered'
>

const AudioControl = ({
  handleToggle,
  handleSeek,
  handleForward,
  handleBackward,
  handlePlaybackRateChange,
  handleSkipToNext,
  isPlaying,
  isLoading,
  playbackRate,
  currentTime,
  duration,
  buffered,
}: AudioControlProps) => {
  const { t } = useTranslation()

  return (
    <div>
      <Scrubber
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        disabled={isLoading}
        onSeek={handleSeek}
        showScrubber
        showTime
      />
      <div {...styles.controlWrapper}>
        <div {...styles.mainControls}>
          <IconButton
            size={32}
            fillColorName={'text'}
            onClick={handleBackward}
            Icon={IconReplay}
            style={{ marginRight: 0 }}
          />
          {isLoading ? (
            <div {...styles.spinner}>
              <Spinner size={32} />
            </div>
          ) : (
            <IconButton
              onClick={handleToggle}
              title={t(
                `styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`,
              )}
              aria-live='assertive'
              Icon={isPlaying ? IconPause : IconPlay}
              size={64}
              fillColorName={'text'}
              style={{ marginRight: 0 }}
            />
          )}
          <IconButton
            size={32}
            fillColorName={'text'}
            onClick={handleForward}
            Icon={IconForward}
            style={{ marginRight: 0 }}
          />
          <IconButton
            size={32}
            fillColorName={'text'}
            onClick={handleSkipToNext}
            Icon={IconSkipNext}
            style={{ marginRight: 0 }}
          />
        </div>
        <PlaybackRateControl
          playbackRate={playbackRate}
          setPlaybackRate={handlePlaybackRateChange}
        />
      </div>
    </div>
  )
}

export default AudioControl
