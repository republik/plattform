import React from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import Scrubber from './Scrubber'
import { CloseIcon, PauseIcon, PlayIcon } from '../Icons'
import { useColorContext } from '../Colors/ColorContext'
import IconButton from '../IconButton'
import { MdExpandLess } from 'react-icons/md'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import Spinner from '../Spinner'
import { underline } from '../../lib/styleMixins'
import { AudioPlayerProps, renderTime } from './shared'

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
    textDecoration: 'none',
    '&[href]:hover': {
      ...underline,
    },
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

type MiniAudioPlayerProps = {
  handleExpand: () => void
  handleToggle: () => void
  handleSeek: (progress: number) => void
  handleClose: () => void
} & Omit<AudioPlayerProps, 'actions' | 'playbackRate'>

const MiniAudioPlayer = ({
  t,
  title,
  sourcePath,
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  buffered,
  handleExpand,
  handleToggle,
  handleSeek,
  handleClose,
}: MiniAudioPlayerProps) => {
  const [colorScheme] = useColorContext()

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
          {title &&
            (sourcePath ? (
              <Link href={sourcePath} passHref>
                <a {...styles.title} {...colorScheme.set('color', 'text')}>
                  {title}
                </a>
              </Link>
            ) : (
              <span {...styles.title}>{title}</span>
            ))}
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
