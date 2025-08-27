import { useEffect, useMemo, useState } from 'react'
import {
  mediaQueries,
  plainButtonRule,
  useColorContext,
  fontStyles,
} from '@project-r/styleguide'
import { css } from 'glamor'
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  HEADER_HORIZONTAL_PADDING,
  ZINDEX_FRAME_TOGGLE,
  TRANSITION_MS,
} from '../constants'
import useAudioQueue from '../Audio/hooks/useAudioQueue'
import { useAudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { IconClose, IconMic } from '@republik/icons'

const SIZE = 28
const PADDING_MOBILE = Math.floor((HEADER_HEIGHT_MOBILE - SIZE) / 2)
const PADDING_DESKTOP = Math.floor((HEADER_HEIGHT - SIZE) / 2)

/**
 * Component to render the toggle element in the top right corner of the frame on top of the nav.
 * If a sub-navigation is expaned, it renders a close button.
 * Otherwise it renders the audio player toggle.
 */
const Toggle = ({ expanded, closeOverlay, ...props }) => {
  const [colorScheme] = useColorContext()
  const { audioQueue } = useAudioQueue()
  const {
    audioPlayerVisible,
    setAudioPlayerVisible,
    isPlaying,
    isExpanded: audioPlayerExpanded,
    setIsExpanded: setAudioPlayerExpanded,
  } = useAudioContext()
  const audioItemsCount = audioQueue?.length

  // Uhh, fix some server-client hydration mismatch thingie
  const [lazyCount, setLazyCount] = useState()
  useEffect(() => {
    if (audioItemsCount !== undefined) {
      setLazyCount(audioItemsCount)
    }
  }, [audioItemsCount])

  const onClick = () => {
    if (expanded) {
      return closeOverlay && closeOverlay()
    }
    // handle close audio player
    if (audioPlayerVisible && audioPlayerExpanded) {
      if (isPlaying) {
        setAudioPlayerExpanded(false)
      } else {
        setAudioPlayerVisible(false)
      }
    }
    // expand mini-player or player if not visible yet
    if (!audioPlayerExpanded) {
      setAudioPlayerExpanded(true)
    }
    // make visible if previously hidden
    if (!audioPlayerVisible) {
      trackEvent(['Navigation', 'toggleAudioPlayer', audioItemsCount])
      setAudioPlayerVisible(true)
    }
  }

  return expanded ? (
    <button {...styles.menuToggle} onClick={onClick} {...props}>
      <div style={{ opacity: !expanded ? 1 : 0 }} {...styles.audioButton}>
        <IconMic {...colorScheme.set('fill', 'text')} size={SIZE} />
        {!!lazyCount && (
          <span
            {...colorScheme.set('background', 'default')}
            {...colorScheme.set('color', 'text')}
            {...styles.audioCount}
          >
            {lazyCount}
          </span>
        )}
      </div>
      <IconClose
        style={{ opacity: expanded ? 1 : 0 }}
        {...styles.closeButton}
        {...colorScheme.set('fill', 'text')}
        size={SIZE}
      />
    </button>
  ) : null
}

const styles = {
  menuToggle: css(plainButtonRule, {
    cursor: 'pointer',
    zIndex: ZINDEX_FRAME_TOGGLE,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    padding: PADDING_MOBILE,
    position: 'relative',
    // Additional 4 px to account for scrollbar
    paddingRight: HEADER_HORIZONTAL_PADDING + 4,
    lineHeight: 0,
    [mediaQueries.mUp]: {
      padding: PADDING_DESKTOP,
    },
  }),
  audioCount: css({
    ...fontStyles.sansSerifMedium,
    position: 'absolute',
    fontSize: 10,
    top: 15,
    left: 30,
    [mediaQueries.mUp]: {
      top: 22,
      left: 36,
    },
  }),
  audioButton: css({
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
  }),
  closeButton: css({
    position: 'absolute',
    // Additional 4 px to account for scrollbar
    right: HEADER_HORIZONTAL_PADDING + 4,
    top: PADDING_MOBILE,
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
    [mediaQueries.mUp]: {
      top: PADDING_DESKTOP,
    },
  }),
}

export default Toggle
