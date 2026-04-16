import React from 'react'
import { css } from 'glamor'
import Scrubber from './controls/Scrubber'
import { AudioPlayerProps } from './shared'
import Time from './ui/Time'
import {
  IconButton,
  Spinner,
  fontStyles,
  mediaQueries,
  useMediaQuery,
} from '@project-r/styleguide'
import AudioPlayerTitle from './ui/AudioPlayerTitle'
import AudioCover from '../AudioPlayer/ui/AudioCover'
import AudioError from './ui/AudioError'
import { IconClose, IconExpandLess, IconPause, IconPlay } from '@republik/icons'

export const MINI_AUDIO_PLAYER_HEIGHT = 68

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: MINI_AUDIO_PLAYER_HEIGHT,
    [mediaQueries.mUp]: {
      marginBottom: 0,
    },
  }),
  playerWrapper: css({
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 8,
    alignItems: 'center',
    padding: '0 16px 0 8px',
  }),
  metaDataWrapper: css({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  }),
  buttonWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    margin: 0,
    '& > *:not(:last-child)': {
      marginRight: 6,
    },
  }),
  spinnerWrapper: css({
    position: 'relative',
    width: 42,
    height: 42,
  }),
  title: css({
    ...fontStyles.sansSerifRegular14,
    textDecoration: 'none',
    '&[href]:hover': {
      textDecoration: 'underline',
    },
  }),
}

type MiniAudioPlayerProps = {
  handleExpand: () => void
  handleToggle: () => void
  handleSeek: (progress: number) => void
  handleClose: () => void
  handleOpenArticle: (path: string) => Promise<void>
} & Omit<AudioPlayerProps, 'actions' | 'queuedItems' | 'playbackRate'>

const MiniAudioPlayer = ({
  t,
  activeItem,
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  buffered,
  handleExpand,
  handleToggle,
  handleSeek,
  handleClose,
  handleOpenArticle,
  hasError,
}: MiniAudioPlayerProps) => {
  const isDesktop = useMediaQuery(mediaQueries.mUp)

  if (!activeItem) {
    handleClose()
    return null
  }

  const {
    document: {
      meta: { title, path, image, format, audioCoverCrop, coverSm },
    },
  } = activeItem

  return (
    <div {...styles.root}>
      <div {...styles.playerWrapper}>
        {isLoading ? (
          <div {...styles.spinnerWrapper}>
            <Spinner size={32} />
          </div>
        ) : (
          <IconButton
            onClick={handleToggle}
            title={t(`styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`)}
            aria-live='assertive'
            Icon={isPlaying ? IconPause : IconPlay}
            size={42}
            fillColorName={'text'}
            style={{ marginRight: 0 }}
          />
        )}
        <AudioCover
          cover={coverSm}
          size={40}
          image={image}
          format={format?.meta}
          audioCoverCrop={audioCoverCrop}
          alt={title}
        />
        {!hasError ? (
          <>
            <div {...styles.metaDataWrapper}>
              <AudioPlayerTitle
                lineClamp={1}
                title={title}
                onClick={() => handleOpenArticle(path)}
              />
              <Time currentTime={currentTime} duration={duration} />
            </div>
            <div {...styles.buttonWrapper}>
              <IconButton
                Icon={IconExpandLess}
                size={32}
                fillColorName='text'
                title={t(`styleguide/AudioPlayer/expand`)}
                onClick={handleExpand}
              />
              <IconButton
                Icon={IconClose}
                size={24}
                fillColorName={'text'}
                onClick={handleClose}
                title={t('styleguide/AudioPlayer/close')}
              />
            </div>
          </>
        ) : (
          <AudioError />
        )}
      </div>
      <div>
        <Scrubber
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onSeek={handleSeek}
          disabled={!isDesktop || isLoading || hasError}
          showScrubber={false}
        />
      </div>
    </div>
  )
}

export default MiniAudioPlayer
