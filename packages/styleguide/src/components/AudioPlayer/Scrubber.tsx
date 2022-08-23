import React, {
  MouseEvent,
  TouchEventHandler,
  useEffect,
  useState,
} from 'react'
import { css } from 'glamor'
import {
  PROGRESS_HEIGHT,
  SLIDERTHUMB_SIZE,
  ZINDEX_AUDIOPLAYER_PROGRESS,
  ZINDEX_AUDIOPLAYER_SCRUB,
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
  scrubber: css({
    position: 'absolute',
    inset: 0,
    height: PROGRESS_HEIGHT,
    zIndex: ZINDEX_AUDIOPLAYER_SCRUB,
    marginTop: -12,
    paddingTop: 16,
    cursor: 'ew-resize',
  }),
  seeking: css({
    cursor: '',
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
  showScrubber?: boolean
}

const Scrubber = ({
  currentTime = 0,
  duration = 0,
  buffered,
  onSeek,
  showScrubber = true,
}: ScrubberProps) => {
  const [colorScheme] = useColorContext()
  const scrubber = React.useRef<HTMLDivElement>(null)
  const [isSeeking, setIsSeeking] = useState(false)

  const progress = currentTime / duration

  const scrub = (pointerPosition: number) => {
    if (!scrubber.current) return
    const scrubberBounds = scrubber.current.getBoundingClientRect()
    const scrubberWidth = scrubberBounds.width
    const scrubberLeft = pointerPosition - scrubberBounds.left
    const progress = scrubberLeft / scrubberWidth
    onSeek(progress)
  }

  const touchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsSeeking(true)
    scrub(e.changedTouches[0].clientX)
  }

  const touchEnd: TouchEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsSeeking(false)
  }

  const touchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    if (isSeeking) {
      scrub(e.changedTouches[0].clientX)
    }
  }

  const mouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsSeeking(true)
    scrub(e.clientX)
  }

  const mouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsSeeking(false)
  }

  const mouseMove = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (isSeeking) {
      scrub(e.clientX)
    }
  }

  useEffect(() => {
    if (isSeeking) {
      const handleDocumentMouseUp = () => setIsSeeking(false)
      document.addEventListener('mouseup', handleDocumentMouseUp)
      return () =>
        document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  })

  return (
    <div {...styles.root}>
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
      {showScrubber && (
        <div
          {...styles.sliderThumb}
          {...colorScheme.set('backgroundColor', 'defaultInverted')}
          style={{
            left: `${progress * 100}%`,
            cursor: isSeeking ? 'grabbing' : 'grab',
          }}
        />
      )}
      <div
        {...styles.scrubber}
        ref={scrubber}
        onTouchStart={touchStart}
        onTouchEnd={touchEnd}
        onTouchMove={touchMove}
        onMouseDown={mouseDown}
        onMouseMove={isSeeking ? mouseMove : undefined}
        onMouseUp={isSeeking ? mouseUp : undefined}
      />
    </div>
  )
}

export default Scrubber
