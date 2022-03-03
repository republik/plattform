import React, { useState } from 'react'
import { css } from 'glamor'

import { ellipsize, underline } from '../../lib/styleMixins'
import { useColorContext } from '../Colors/useColorContext'
import { plainButtonRule } from '../Button'
import { MdExpandLess, MdReplay10 } from 'react-icons/md'
import {
  sansSerifRegular12,
  sansSerifRegular14,
  sansSerifRegular15,
  sansSerifMedium14,
} from '../Typography/styles'
import { InlineSpinner } from '../Spinner'

import { PlayIcon, PauseIcon, ForwardIcon, CloseIcon } from '../Icons'
import Scrubber from './Scrubber'

import {
  ZINDEX_AUDIOPLAYER_ICONS,
  PROGRESS_HEIGHT,
  progressbarStyle,
  DefaultLink,
} from './constants'

type AudioInfoProps = {
  expanded: boolean
  loading: boolean
  sourceError: any
  reload: () => void
  title: string
  sourcePath: string
  Link: React.ReactType
  formattedCurrentTime: string
  formattedDuration: string
  t: (key: string) => string
}

interface ExtendePlayerProps extends AudioInfoProps {
  playbackElement: React.ReactNode
  audio: HTMLAudioElement
  scrubRef: React.Ref<HTMLDivElement>
  containerRef: React.Ref<HTMLDivElement>
  playing: boolean
  playEnabled: boolean
  progress: number
  buffered: any
  playbackRate: number
  setPlaybackRate: (rate: number) => void
  toggle: () => void
  scrubStart: () => void
  scrub: () => void
  scrubEnd: () => void
  timeRanges: { start: number; end: number }[]
  closeHandler: () => void
  setTime: (time: number) => void
}

const styles = {
  container: css({}),
  expandedContainer: css({
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 18,
  }),
  expandedPlayButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  }),
  controls: css({
    display: 'flex',
    gap: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 54,
    padding: '0 8px 0 4px',
  }),
  button: css({
    ...plainButtonRule,
    display: 'block',
  }),
  textArea: css({
    flex: 1,
    minWidth: 0,
    ...sansSerifRegular15,
    textDecoration: 'none',
    margin: 0,
  }),
  ellipsize: css({
    ...ellipsize,
  }),
  time: css({ ...sansSerifRegular14, margin: 0 }),
  scrubber: css({
    ...progressbarStyle,
    bottom: -PROGRESS_HEIGHT,
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
  }),
  sourceError: css({
    ...sansSerifRegular12,
  }),
  sourceErrorButton: css({
    ...underline,
    whiteSpace: 'nowrap',
    display: 'inline-block',
  }),
  fixedControls: css({
    display: 'flex',
    gap: 8,
  }),
  playbackButton: css({
    ...sansSerifMedium14,
    marginLeft: 12,
    lineHeight: '18px',
  }),
  playBackRateButtons: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  }),
}

const AudioInfo = ({
  expanded,
  sourceError,
  loading,
  reload,
  title,
  sourcePath,
  Link,
  formattedCurrentTime,
  formattedDuration,
  t,
}: AudioInfoProps) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.textArea}
      {...(!sourceError && !expanded && styles.ellipsize)}
      style={{ textAlign: expanded ? 'center' : 'left' }}
      {...colorScheme.set('color', 'text')}
    >
      {loading ? (
        <InlineSpinner size={25} />
      ) : sourceError ? (
        <div {...styles.sourceError} {...colorScheme.set('color', 'disabled')}>
          {t('styleguide/AudioPlayer/sourceError')}{' '}
          <button
            {...plainButtonRule}
            {...styles.sourceErrorButton}
            onClick={() => reload()}
          >
            {t('styleguide/AudioPlayer/sourceErrorTryAgain')}
          </button>
        </div>
      ) : (
        <>
          {title && (
            <Link href={sourcePath} passHref>
              <a {...colorScheme.set('color', 'text')} href={sourcePath}>
                {title}
              </a>
            </Link>
          )}
          <p
            {...styles.time}
            style={{ marginTop: expanded ? 8 : 0 }}
            {...colorScheme.set('color', 'textSoft')}
            tabIndex={0}
          >
            {formattedCurrentTime && formattedCurrentTime}
            {formattedCurrentTime && formattedDuration && ' / '}
            {formattedDuration && formattedDuration}
          </p>
        </>
      )}
    </div>
  )
}

const ExpandableAudioPlayer = ({
  containerRef,
  scrubRef,
  playbackElement,
  playing,
  playEnabled,
  progress,
  loading,
  buffered,
  sourceError,
  playbackRate,
  toggle,
  reload,
  scrubStart,
  scrub,
  scrubEnd,
  audio,
  timeRanges,
  closeHandler,
  title,
  t,
  Link = DefaultLink,
  sourcePath,
  formattedCurrentTime,
  formattedDuration,
  setTime,
  setPlaybackRate,
}: ExtendePlayerProps) => {
  const [colorScheme] = useColorContext()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaybackRateExpanded, setIsPlaybackRateExpanded] = useState(false)

  return (
    <div
      {...styles.container}
      {...colorScheme.set('backgroundColor', 'overlay')}
      ref={containerRef}
    >
      {isExpanded && (
        <div
          {...styles.expandedContainer}
          style={{ paddingBottom: isPlaybackRateExpanded ? 0 : 16 }}
        >
          <>
            <AudioInfo
              expanded={true}
              sourceError={sourceError}
              loading={loading}
              reload={reload}
              title={title}
              sourcePath={sourcePath}
              Link={Link}
              formattedCurrentTime={formattedCurrentTime}
              formattedDuration={formattedDuration}
              t={t}
            />
            <div {...styles.expandedPlayButton}>
              <button
                {...styles.button}
                {...plainButtonRule}
                onClick={
                  playEnabled
                    ? () => {
                        setTime(audio.currentTime - 10)
                      }
                    : null
                }
                title={t('styleguide/AudioPlayer/partialfastforward')}
              >
                <MdReplay10
                  size={24}
                  {...(playEnabled && progress > 0
                    ? colorScheme.set('fill', 'text')
                    : colorScheme.set('fill', 'disabled'))}
                />
              </button>
              <button
                {...styles.button}
                {...plainButtonRule}
                onClick={playEnabled ? toggle : null}
                title={t(
                  `styleguide/AudioPlayer/${playing ? 'pause' : 'play'}`,
                )}
                aria-live='assertive'
              >
                {playing ? (
                  <PauseIcon size={54} {...colorScheme.set('fill', 'text')} />
                ) : (
                  <PlayIcon
                    size={54}
                    {...(playEnabled
                      ? colorScheme.set('fill', 'text')
                      : colorScheme.set('fill', 'disabled'))}
                  />
                )}
              </button>
              <button
                {...styles.button}
                {...plainButtonRule}
                onClick={
                  playEnabled
                    ? () => {
                        setTime(audio.currentTime + 30)
                      }
                    : null
                }
                title={t('styleguide/AudioPlayer/partialfastforward')}
              >
                <ForwardIcon
                  size={24}
                  {...(playEnabled && progress > 0
                    ? colorScheme.set('fill', 'text')
                    : colorScheme.set('fill', 'disabled'))}
                />
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Scrubber
                ref={scrubRef}
                progress={progress}
                playing={playing}
                scrubStart={scrubStart}
                scrub={scrub}
                scrubEnd={scrubEnd}
                audio={audio}
                timeRanges={timeRanges}
              />
            </div>
            {isPlaybackRateExpanded && (
              <div {...styles.playBackRateButtons}>
                {[0.75, 1, 1.25].map((rate) => {
                  return (
                    <button
                      key={rate}
                      {...plainButtonRule}
                      {...styles.playbackButton}
                      style={{ opacity: rate === playbackRate ? 1 : 0.6 }}
                      onClick={() => {
                        setPlaybackRate(rate)
                        setIsPlaybackRateExpanded(false)
                      }}
                    >
                      {rate}x
                    </button>
                  )
                })}
              </div>
            )}
          </>
        </div>
      )}
      {playbackElement}
      <div {...styles.controls}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'flex-start',
            gap: 16,
            minWidth: 0,
          }}
        >
          {isExpanded ? (
            <button
              {...plainButtonRule}
              {...styles.playbackButton}
              onClick={() => setIsPlaybackRateExpanded(!isPlaybackRateExpanded)}
            >
              {playbackRate}x
            </button>
          ) : (
            <>
              <button
                {...styles.button}
                {...plainButtonRule}
                // style={{ marginLeft: playing ? -10.5 : -11.375 }}
                onClick={playEnabled ? toggle : null}
                title={t(
                  `styleguide/AudioPlayer/${playing ? 'pause' : 'play'}`,
                )}
                aria-live='assertive'
              >
                {playing ? (
                  <PauseIcon size={42} {...colorScheme.set('fill', 'text')} />
                ) : (
                  <PlayIcon
                    size={42}
                    {...(playEnabled
                      ? colorScheme.set('fill', 'text')
                      : colorScheme.set('fill', 'disabled'))}
                  />
                )}
              </button>
              <AudioInfo
                expanded={false}
                sourceError={sourceError}
                loading={loading}
                reload={reload}
                title={title}
                sourcePath={sourcePath}
                Link={Link}
                formattedCurrentTime={formattedCurrentTime}
                formattedDuration={formattedDuration}
                t={t}
              />
            </>
          )}
        </div>
        <div {...styles.fixedControls}>
          <button
            title={t('styleguide/AudioPlayer/close')}
            onClick={() => setIsExpanded(!isExpanded)}
            {...plainButtonRule}
          >
            <MdExpandLess
              size={32}
              {...colorScheme.set('fill', 'text')}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease-in-out',
              }}
            />
          </button>
          <button
            title={t('styleguide/AudioPlayer/close')}
            onClick={closeHandler}
            {...plainButtonRule}
          >
            <CloseIcon size={24} {...colorScheme.set('fill', 'text')} />
          </button>
        </div>
      </div>
      {!isExpanded && (
        <div style={{ position: 'relative' }}>
          <div {...styles.scrubber}>
            <Scrubber
              ref={scrubRef}
              progress={progress}
              playing={playing}
              scrubStart={scrubStart}
              scrub={scrub}
              scrubEnd={scrubEnd}
              audio={audio}
              timeRanges={timeRanges}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpandableAudioPlayer
