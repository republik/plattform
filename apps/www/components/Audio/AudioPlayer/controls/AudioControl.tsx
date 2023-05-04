import React, { Dispatch, SetStateAction } from 'react'
import { css } from 'glamor'
import { IconButton, Spinner, mediaQueries } from '@project-r/styleguide'
import { useTranslation } from '../../../../lib/withT'
import { AudioPlayerProps } from '../shared'
import PlaybackRateControl from './PlaybackRateControl'
import Scrubber from './Scrubber'
import {
  IconForward,
  IconPause,
  IconPlay,
  IconReplay,
  IconSkipNext,
} from '@republik/icons'
import { IconAutoplay } from '@republik/icons'
import { IconAutopause } from '@republik/icons'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  controlWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
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
  secondaryControls: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    gap: 16,
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
  isAutoPlayEnabled: boolean
  setAutoPlayEnabled: Dispatch<SetStateAction<boolean>>
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
  isAutoPlayEnabled,
  setAutoPlayEnabled,
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
        <div {...styles.secondaryControls}>
          <div>
            <IconButton
              Icon={isAutoPlayEnabled ? IconAutoplay : IconAutopause}
              label={t(
                isAutoPlayEnabled
                  ? 'styleguide/AudioPlayer/autoplayOn'
                  : 'styleguide/AudioPlayer/autoplayOff',
              )}
              labelShort={t(
                isAutoPlayEnabled
                  ? 'styleguide/AudioPlayer/autoplayOn'
                  : 'styleguide/AudioPlayer/autoplayOff',
              )}
              onClick={() => setAutoPlayEnabled(!isAutoPlayEnabled)}
            />
          </div>
          <PlaybackRateControl
            playbackRate={playbackRate}
            setPlaybackRate={handlePlaybackRateChange}
          />
        </div>
      </div>
    </div>
  )
}

export default AudioControl
