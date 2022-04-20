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
  sansSerifMedium16,
  sansSerifRegular16,
  sansSerifRegular17,
} from '../Typography/styles'
import { InlineSpinner } from '../Spinner'

import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  CloseIcon,
  DownloadIcon,
} from '../Icons'
import Scrubber from './Scrubber'

import {
  ZINDEX_AUDIOPLAYER_ICONS,
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
  canSetTime: boolean
  progress: number
  playbackRate: number
  setPlaybackRate: (rate: number) => void
  toggle: () => void
  scrubStart: () => void
  scrub: () => void
  scrubEnd: () => void
  timeRanges: { start: number; end: number }[]
  closeHandler: () => void
  setTime: (time: number) => void
  download: boolean
  src: {
    mp3: string
    aac: string
    ogg: string
    hls: string
    mp4: string
  }
  height: number
}

const styles = {
  expandedContainer: css({
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 16px 0 16px',
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
  }),
  button: css(plainButtonRule, {
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
  title: css({
    textDecoration: 'none',
    '@media (hover)': {
      ':hover': {
        ...underline,
      },
    },
  }),
  expandedTitle: css({
    ...sansSerifRegular17,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  }),
  time: css({
    ...sansSerifRegular14,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    margin: 0,
  }),
  expandedTime: css({
    ...sansSerifRegular16,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    margin: 0,
  }),
  scrubber: css({
    ...progressbarStyle,
    bottom: 0,
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
  }),
  sourceError: css({
    ...sansSerifRegular12,
    margin: '4px 0 0 0',
  }),
  sourceErrorButton: css({
    ...underline,
    whiteSpace: 'nowrap',
    display: 'inline-block',
  }),
  leftControls: css({
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    minWidth: 0,
  }),
  rightControls: css({
    display: 'flex',
    gap: 8,
  }),
  playBackRateButtons: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
  }),
  playbackRateButton: css({
    lineHeight: '18px',
    '::after': {
      ...sansSerifMedium16,
      display: 'block',
      content: 'attr(title)',
      height: 0,
      overflow: 'hidden',
      visibility: 'hidden',
    },
  }),
  playbackRateButtonActive: css({
    ...sansSerifMedium16,
  }),
  playbackRateButtonInActive: css({
    ...sansSerifRegular16,
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
      {...(!expanded && styles.ellipsize)}
      style={{
        textAlign: expanded ? 'center' : 'left',
      }}
      {...colorScheme.set('color', 'text')}
    >
      {loading ? (
        <InlineSpinner size={25} />
      ) : (
        <>
          {title && (
            <Link href={sourcePath} passHref>
              <a
                {...styles.title}
                {...(expanded && styles.expandedTitle)}
                {...colorScheme.set('color', 'text')}
                href={sourcePath}
              >
                {title}
              </a>
            </Link>
          )}
          {sourceError ? (
            <p {...styles.sourceError} {...colorScheme.set('color', 'error')}>
              {t('styleguide/AudioPlayer/sourceError')}{' '}
              <button
                {...plainButtonRule}
                {...styles.sourceErrorButton}
                onClick={() => reload()}
              >
                {t('styleguide/AudioPlayer/sourceErrorTryAgain')}
              </button>
            </p>
          ) : (
            <p
              {...(expanded ? styles.expandedTime : styles.time)}
              style={{ marginTop: expanded ? 8 : 0 }}
              {...colorScheme.set('color', 'textSoft')}
              tabIndex={0}
            >
              {formattedCurrentTime && formattedCurrentTime}
              {formattedCurrentTime && formattedDuration && ' / '}
              {formattedDuration && formattedDuration}
            </p>
          )}
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
  canSetTime,
  progress,
  loading,
  sourceError,
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
  playbackRate,
  setPlaybackRate,
  download,
  src,
  height = 68,
}: ExtendePlayerProps) => {
  const [colorScheme] = useColorContext()
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div {...colorScheme.set('backgroundColor', 'overlay')} ref={containerRef}>
      {isExpanded && (
        <div {...styles.expandedContainer}>
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
                  canSetTime
                    ? () => {
                        setTime(audio.currentTime - 10 * playbackRate)
                      }
                    : null
                }
                title={t('styleguide/AudioPlayer/partialfastforward')}
              >
                <MdReplay10
                  size={24}
                  {...(canSetTime && progress > 0
                    ? colorScheme.set('fill', 'text')
                    : colorScheme.set('fill', 'disabled'))}
                />
              </button>
              <button
                {...styles.button}
                {...plainButtonRule}
                onClick={toggle}
                title={t(
                  `styleguide/AudioPlayer/${playing ? 'pause' : 'play'}`,
                )}
                aria-live='assertive'
              >
                {playing ? (
                  <PauseIcon
                    size={54}
                    {...colorScheme.set(
                      'fill',
                      sourceError ? 'disabled' : 'text',
                    )}
                  />
                ) : (
                  <PlayIcon
                    size={54}
                    {...colorScheme.set(
                      'fill',
                      sourceError ? 'disabled' : 'text',
                    )}
                  />
                )}
              </button>
              <button
                {...styles.button}
                {...plainButtonRule}
                onClick={
                  canSetTime
                    ? () => {
                        setTime(audio.currentTime + 30 * playbackRate)
                      }
                    : null
                }
                title={t('styleguide/AudioPlayer/partialfastforward')}
              >
                <ForwardIcon
                  size={24}
                  {...(canSetTime && progress > 0
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
            <div {...styles.playBackRateButtons}>
              {[
                { speed: 0.75, label: '0,75×' },
                { speed: 1, label: '1×' },
                { speed: 1.25, label: '1,25×' },
                { speed: 1.5, label: '1,5×' },
                { speed: 2, label: '2×' },
              ].map((rate) => {
                return (
                  <button
                    key={rate.speed}
                    {...plainButtonRule}
                    {...styles.playbackRateButton}
                    {...(rate.speed === playbackRate
                      ? styles.playbackRateButtonActive
                      : styles.playbackRateButtonInActive)}
                    style={{
                      opacity: rate.speed === playbackRate ? 1 : 0.6,
                    }}
                    onClick={() => setPlaybackRate(rate.speed)}
                  >
                    {rate.label}
                  </button>
                )
              })}
            </div>
          </>
        </div>
      )}
      {playbackElement}
      <div
        {...styles.controls}
        style={{ padding: `0 10px 0 ${isExpanded ? 10 : 4}px`, height: height }}
      >
        <div {...styles.leftControls}>
          {isExpanded ? (
            <>
              {download && !sourceError && (
                <button {...styles.button} {...plainButtonRule}>
                  <a
                    href={src.mp3 || src.aac || src.mp4}
                    download
                    title={t('styleguide/AudioPlayer/download')}
                  >
                    <DownloadIcon
                      size={22}
                      {...colorScheme.set('fill', 'text')}
                    />
                  </a>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                {...styles.button}
                {...plainButtonRule}
                style={{ width: 42, paddingLeft: playing ? 4 : 0 }}
                onClick={toggle}
                title={t(
                  `styleguide/AudioPlayer/${playing ? 'pause' : 'play'}`,
                )}
                aria-live='assertive'
              >
                {playing ? (
                  <PauseIcon
                    size={42}
                    {...colorScheme.set(
                      'fill',
                      sourceError ? 'disabled' : 'text',
                    )}
                  />
                ) : (
                  <PlayIcon
                    size={42}
                    {...colorScheme.set(
                      'fill',
                      sourceError ? 'disabled' : 'text',
                    )}
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
        <div {...styles.rightControls}>
          <button
            title={t(
              `styleguide/AudioPlayer/${isExpanded ? 'shrink' : 'expand'}`,
            )}
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
              noThumb
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpandableAudioPlayer
