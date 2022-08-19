import React, { useState } from 'react'
import { css } from 'glamor'
import {
  PROGRESS_HEIGHT,
  SLIDERTHUMB_SIZE,
  ZINDEX_AUDIOPLAYER_PROGRESS,
} from '../LegacyAudioPlayer/constants'
import { useColorContext } from '../Colors/useColorContext'

function times(x) {
  return Array.from({ length: x }, (_, i) => i)
}

const styles = {
  root: css({
    position: 'relative',
    width: '100%',
    height: PROGRESS_HEIGHT,
    backgroundColor: '#eee',
  }),
  progress: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_PROGRESS,
    left: 0,
    top: 0,
    bottom: 0,
    height: PROGRESS_HEIGHT,
    backgroundColor: '#444', // TODO: define played styling
  }),
  bufferedWrapper: css({
    position: 'relative',
    inset: 0,
    width: '100%',
    height: PROGRESS_HEIGHT,
  }),
  buffered: css({
    // TODO: define styling for buffered
    position: 'absolute',
    backgroundColor: '#d1d1d1',
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
}

type ScrubberProps = {
  currentTime?: number
  duration?: number
  buffered?: TimeRanges
  /**
   * Returns the current progress as a percentage value
   * of where to seek to.
   */
  onSeek: (progress: number) => void
}

const Scrubber = ({
  currentTime = 0,
  duration = 0,
  buffered,
  onSeek,
}: ScrubberProps) => {
  const [colorScheme] = useColorContext()
  const scrubber = React.useRef<HTMLDivElement>(null)

  const progress = currentTime / duration
  console.log('progress', progress)

  return (
    <div ref={scrubber} {...styles.root}>
      <div
        {...styles.sliderThumb}
        {...colorScheme.set('backgroundColor', 'defaultInverted')}
        style={{
          left: `${progress * 100}%`,
        }}
      />
      <div {...styles.bufferedWrapper}>
        {buffered &&
          times(buffered.length).map((i) => {
            const start = buffered.start(i)
            const end = buffered.end(i)
            const width = ((end - start) / duration) * 100
            return (
              <div
                key={i}
                {...styles.buffered}
                style={{
                  left: `${(start / duration) * 100}%`,
                  width: `${width}%`,
                }}
              />
            )
          })}
      </div>
      <div {...styles.progress} style={{ width: `${progress * 100}%` }} />
    </div>
  )
}

export default Scrubber
