import React, { useState } from 'react'
import { css } from 'glamor'
import Scrubber from './Scrubber'
import { CloseIcon, PauseIcon, PlayIcon } from '../Icons'
import { useColorContext } from '../Colors/ColorContext'
import IconButton from '../IconButton'
import Loader from '../Loader'
import { MdExpandLess } from 'react-icons/md'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import Spinner from '../Spinner'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: 68,
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
    ...sansSerifRegular15,
  }),
  time: css({
    ...sansSerifRegular14,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    margin: 0,
  }),
}

const SIZE = {
  play: 30,
  close: 30,
  download: 22,
  forward: 22,
  replay: 22,
}

type AudioPlayerActions = {
  onPlay: () => void
  onPause: () => void
  onSeek: (progress: number) => void
  onForward: () => void
  onBackward: () => void
  onClose: () => void
}

type AudioPlayerProps = {
  title: string
  isPlaying?: boolean
  isLoading?: boolean
  //
  currentTime?: number
  duration?: number
  buffered?: TimeRanges
  //
  actions: AudioPlayerActions
  t: any
}

const renderTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const AudioPlayer = ({
  t,
  title,
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  buffered,
  actions,
}: AudioPlayerProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [colorScheme] = useColorContext()

  const toggleAudioPlayer = () => {
    if (isPlaying) {
      actions.onPause()
    } else {
      actions.onPlay()
    }
  }

  return (
    <div {...styles.root}>
      <div {...styles.playerWrapper}>
        {isLoading ? (
          <div {...styles.spinnerWrapper}>
            <Spinner size={32} />
          </div>
        ) : (
          <IconButton
            onClick={toggleAudioPlayer}
            title={t(`styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`)}
            aria-live='assertive'
            Icon={isPlaying ? PauseIcon : PlayIcon}
            size={42}
            fillColorName={'text'}
            style={{ marginRight: 0 }}
          />
        )}
        <div {...styles.metaDataWrapper}>
          <span {...styles.title}>{title}</span>
          <span {...styles.time} {...colorScheme.set('color', 'textSoft')}>
            {' '}
            {renderTime(currentTime)} / {renderTime(duration)}
          </span>
        </div>
        <div {...styles.buttonWrapper}>
          <IconButton
            Icon={MdExpandLess}
            size={32}
            fillColorName='text'
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease-in-out',
            }}
            title={t(
              `styleguide/AudioPlayer/${isExpanded ? 'shrink' : 'expand'}`,
            )}
          />
          <IconButton
            Icon={CloseIcon}
            size={24}
            fillColorName={'text'}
            onClick={() => actions.onClose()}
            title={t('styleguide/AudioPlayer/close')}
          />
        </div>
      </div>
      <div {...styles.scrubberWrapper}>
        <Scrubber
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onSeek={actions.onSeek}
          showScrubber={isExpanded}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

export default AudioPlayer
