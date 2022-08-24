import React, {
  MouseEvent,
  TouchEventHandler,
  useEffect,
  useMemo,
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
import debounce from 'lodash/debounce'

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
    inset: 0,
    height: PROGRESS_HEIGHT,
    transition: 'width 100ms ease-in-out',
  }),
  scrubber: (disabled: boolean) =>
    css({
      position: 'absolute',
      inset: 0,
      height: PROGRESS_HEIGHT,
      zIndex: ZINDEX_AUDIOPLAYER_SCRUB,
      marginTop: -12,
      paddingTop: 16,
      marginBottom: -12,
      paddingBottom: 10,
      cursor: disabled ? 'default' : 'ew-resize',
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
    position: 'absolute',
    height: PROGRESS_HEIGHT,
    opacity: 0.25,
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
  disabled?: boolean
}

const Scrubber = ({
  currentTime = 0,
  duration = 0,
  buffered,
  onSeek,
  showScrubber = true,
  disabled = false,
}: ScrubberProps) => {
  const [colorScheme] = useColorContext()
  const scrubber = React.useRef<HTMLDivElement>(null)
  const [isSeeking, setIsSeeking] = useState(false)
  const [internalProgress, setInternalProgress] = useState(0)

  const audioProgress = currentTime / duration

  const progress = isSeeking ? internalProgress : audioProgress

  useEffect(() => {
    if (!isSeeking) {
      setInternalProgress(audioProgress)
    }
  }, [audioProgress, setInternalProgress])

  const debouncedSeek = useMemo(
    () => debounce((progress) => onSeek(progress), 1000 / 60),
    [onSeek],
  )

  const scrub = (pointerPosition: number, force = false) => {
    if (!scrubber.current) return
    const scrubberBounds = scrubber.current.getBoundingClientRect()
    const scrubberWidth = scrubberBounds.width
    const scrubberLeft = pointerPosition - scrubberBounds.left
    const progress = scrubberLeft / scrubberWidth
    setInternalProgress(progress)
    // Debounce syncing to the audio-container
    if (force) {
      onSeek(progress)
    } else {
      debouncedSeek(progress)
    }
  }

  const touchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsSeeking(true)
    scrub(e.changedTouches[0].clientX)
  }

  const touchEnd: TouchEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsSeeking(false)
    scrub(e.changedTouches[0].clientX, true)
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
    scrub(e.nativeEvent.clientX)
  }

  const mouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsSeeking(false)
    scrub(e.nativeEvent.clientX, true)
  }

  const mouseMove = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (isSeeking) {
      scrub(e.nativeEvent.clientX)
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
      <div
        {...styles.bufferedWrapper}
        {...colorScheme.set('backgroundColor', 'divider')}
      >
        {buffered &&
          times(buffered.length).map((i) => {
            const start = buffered.start(i)
            const end = buffered.end(i)
            const width = ((end - start) / duration) * 100
            return (
              <div
                key={i}
                {...styles.buffered}
                {...colorScheme.set('backgroundColor', 'defaultInverted')}
                style={{
                  left: `${(start / duration) * 100}%`,
                  width: `${width}%`,
                }}
              />
            )
          })}
      </div>
      <div
        {...styles.progress}
        {...colorScheme.set('backgroundColor', 'text')}
        style={{ width: `${progress * 100}%` }}
      />
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
        {...styles.scrubber(disabled)}
        ref={scrubber}
        onTouchStart={!disabled ? touchStart : undefined}
        onTouchEnd={!disabled ? touchEnd : undefined}
        onTouchMove={!disabled ? touchMove : undefined}
        onMouseDown={!disabled ? mouseDown : undefined}
        onMouseMove={isSeeking ? mouseMove : undefined}
        onMouseUp={isSeeking ? mouseUp : undefined}
      />
    </div>
  )
}

export default Scrubber
