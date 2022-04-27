import React, { Ref, forwardRef } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/useColorContext'

import {
  ZINDEX_AUDIOPLAYER_SCRUB,
  ZINDEX_AUDIOPLAYER_PROGRESS,
  ZINDEX_AUDIOPLAYER_BUFFER,
  ZINDEX_AUDIOPLAYER_TOTAL,
  SLIDERTHUMB_SIZE,
  PROGRESS_HEIGHT,
  progressbarStyle,
} from './constants'

const styles = {
  progress: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_PROGRESS,
    left: 0,
    height: PROGRESS_HEIGHT,
  }),
  sliderThumb: css({
    zIndex: 2,
    top: '-4px',
    borderRadius: 6,
    position: 'absolute',
    width: SLIDERTHUMB_SIZE,
    height: SLIDERTHUMB_SIZE,
    transition: 'opacity ease-out 0.3s',
  }),
  scrub: css({
    ...progressbarStyle,
    zIndex: ZINDEX_AUDIOPLAYER_SCRUB,
    height: 20,
    marginTop: -((20 + PROGRESS_HEIGHT) / 2),
    paddingTop: 20 / 2 - PROGRESS_HEIGHT / 2,
    cursor: 'ew-resize',
  }),
  buffer: css({
    ...progressbarStyle,
    zIndex: ZINDEX_AUDIOPLAYER_BUFFER,
  }),
  timeRange: css({
    position: 'absolute',
    height: PROGRESS_HEIGHT,
  }),
  totalDuration: css({
    ...progressbarStyle,
    zIndex: ZINDEX_AUDIOPLAYER_TOTAL,
  }),
}

type Props = {
  progress: number
  playing: boolean
  scrub: (event) => void
  scrubStart: (event) => void
  scrubEnd: (event) => void
  timeRanges: Array<{ start: number; end: number }>
  audio: HTMLAudioElement
  noThumb?: boolean
}

const Scrubber = (
  {
    progress,
    playing,
    scrubStart,
    scrub,
    scrubEnd,
    audio,
    timeRanges,
    noThumb,
  }: Props,
  ref: Ref<HTMLDivElement>,
) => {
  const [colorScheme] = useColorContext()

  return (
    <>
      <div
        {...styles.progress}
        {...colorScheme.set('backgroundColor', 'text')}
        style={{ width: `${progress * 100}%` }}
      />
      {!noThumb && (
        <div
          {...styles.sliderThumb}
          {...colorScheme.set('backgroundColor', 'defaultInverted')}
          style={{
            opacity: playing || progress > 0 ? 1 : 0,
            left: `calc(${progress * 100}% - ${progress * SLIDERTHUMB_SIZE}px)`,
          }}
        />
      )}
      <div
        {...styles.scrub}
        ref={ref}
        onTouchStart={scrubStart}
        onTouchMove={scrub}
        onTouchEnd={scrubEnd}
        onMouseDown={scrubStart}
      />
      <div
        {...styles.buffer}
        {...colorScheme.set('backgroundColor', 'divider')}
      >
        {audio &&
          timeRanges.map(({ start, end }, index) => (
            <span
              key={index}
              {...styles.timeRange}
              {...colorScheme.set('backgroundColor', 'defaultInverted')}
              style={{
                opacity: 0.25,
                left: `${(start / audio.duration) * 100}%`,
                width: `${((end - start) / audio.duration) * 100}%`,
              }}
            />
          ))}
      </div>
      <div
        {...styles.totalDuration}
        {...colorScheme.set('backgroundColor', 'default')}
      />
    </>
  )
}

export default forwardRef(Scrubber)
