import React from 'react'
import { css } from 'glamor'
import Scrubber from './ui/Scrubber'
import { AudioPlayerProps } from './shared'
import Time from './ui/Time'
import {
  IconButton,
  Spinner,
  fontStyles,
  PlayIcon,
  PauseIcon,
  CloseIcon,
  ExpandLessIcon,
  mediaQueries,
} from '@project-r/styleguide'
import AudioPlayerTitle from './ui/AudioPlayerTitle'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: 68,
    marginBottom: 8,
    [mediaQueries.mUp]: {
      marginBottom: 0,
    },
  }),
  scrubberWrapper: css({}),
  playerWrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '0 10px 0 4px',
  }),
  metaDataWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    marginLeft: 16,
  }),
  buttonWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 4,
    '& > *:not(:last-child)': {
      marginRight: 4,
    },
  }),
  spinnerWrapper: css({
    position: 'relative',
    width: 42,
    height: 42,
  }),
  title: css({
    ...fontStyles.sansSerifRegular15,
    textDecoration: 'none',
    '&[href]:hover': {
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    },
  }),
}

type MiniAudioPlayerProps = {
  handleExpand: () => void
  handleToggle: () => void
  handleSeek: (progress: number) => void
  handleClose: () => void
  handleOpenArticle: (item: AudioQueueItem) => Promise<void>
} & Omit<AudioPlayerProps, 'actions' | 'queuedItems'>

const MiniAudioPlayer = ({
  t,
  activeItem,
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  buffered,
  playbackRate,
  handleExpand,
  handleToggle,
  handleSeek,
  handleClose,
  handleOpenArticle,
}: MiniAudioPlayerProps) => {
  const {
    document: {
      meta: { title, path },
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
            Icon={isPlaying ? PauseIcon : PlayIcon}
            size={42}
            fillColorName={'text'}
            style={{ marginRight: 0 }}
          />
        )}
        <div {...styles.metaDataWrapper}>
          <AudioPlayerTitle
            title={title}
            onClick={() => handleOpenArticle(activeItem)}
          />
          <Time
            currentTime={currentTime / playbackRate}
            duration={duration / playbackRate}
          />
        </div>
        <div {...styles.buttonWrapper}>
          <IconButton
            Icon={ExpandLessIcon}
            size={32}
            fillColorName='text'
            title={t(`styleguide/AudioPlayer/expand`)}
            onClick={handleExpand}
          />
          <IconButton
            Icon={CloseIcon}
            size={24}
            fillColorName={'text'}
            onClick={handleClose}
            title={t('styleguide/AudioPlayer/close')}
          />
        </div>
      </div>
      <div {...styles.scrubberWrapper}>
        <Scrubber
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onSeek={handleSeek}
          disabled={isLoading}
          showScrubber={false}
        />
      </div>
    </div>
  )
}

export default MiniAudioPlayer
