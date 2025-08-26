import React, { Dispatch, SetStateAction, useMemo } from 'react'
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
    alignItems: 'flex-start',
    marginTop: 24,
    gap: 24,
  }),
  mainControls: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-center',
    alignItems: 'center',
    gap: 24,
  }),
  secondaryControls: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 32,
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

  const isAutoPlayOnText = t('styleguide/AudioPlayer/autoplayOn')
  const isAutoPlayOffText = t('styleguide/AudioPlayer/autoplayOff')
  const autoPlayText = isAutoPlayEnabled ? isAutoPlayOnText : isAutoPlayOffText

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
        <div {...styles.secondaryControls}>
          <div>
            <IconButton
              Icon={isAutoPlayEnabled ? IconAutoplay : IconAutopause}
              label={autoPlayText}
              labelShort={autoPlayText}
              onClick={() => setAutoPlayEnabled(!isAutoPlayEnabled)}
              style={{ marginRight: 0, minWidth: 125 }}
            />
          </div>
          <PlaybackRateControl
            playbackRate={playbackRate}
            setPlaybackRate={handlePlaybackRateChange}
          />
        </div>
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
      </div>
    </div>
  )
}

export default AudioControl
