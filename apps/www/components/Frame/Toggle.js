import { useMemo } from 'react'
import {
  CloseIcon,
  MicIcon,
  mediaQueries,
  plainButtonRule,
  useColorContext,
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
import { trackEvent } from '../../lib/matomo'

const SIZE = 28
const PADDING_MOBILE = Math.floor((HEADER_HEIGHT_MOBILE - SIZE) / 2)
const PADDING_DESKTOP = Math.floor((HEADER_HEIGHT - SIZE) / 2)

const Toggle = ({ expanded, closeOverlay, ...props }) => {
  const [colorScheme] = useColorContext()
  const { audioQueue } = useAudioQueue()
  const {
    audioPlayerVisible,
    setAudioPlayerVisible,
    audioPlayerExpanded,
    setAudioPlayerExpanded,
  } = useAudioContext()
  const audioItemsCount = audioQueue?.length

  const disableAudioBtn = !expanded && audioPlayerVisible && audioPlayerExpanded

  const buttonStyle = useMemo(
    () => ({
      opacity: expanded ? 0.000001 : disableAudioBtn ? 0.33 : 1, // hacky fix for browser rendering issue in FF
      transition: `opacity ${TRANSITION_MS}ms ease-out`,
    }),
    [expanded, disableAudioBtn],
  )

  const onClick = () => {
    if (expanded) {
      return closeOverlay && closeOverlay()
    }
    if (!audioPlayerExpanded) {
      setAudioPlayerExpanded(true)
    }
    if (!audioPlayerVisible) {
      trackEvent(['Navigation', 'toggleAudioPlayer', audioItemsCount])
      setAudioPlayerVisible(true)
    }
  }

  return (
    <button
      {...styles.menuToggle}
      disabled={disableAudioBtn}
      onClick={onClick}
      {...props}
    >
      <MicIcon
        style={buttonStyle}
        {...colorScheme.set('fill', 'text')}
        size={SIZE}
      />
      {!!audioItemsCount && (
        <span
          style={buttonStyle}
          {...colorScheme.set('background', 'default')}
          {...styles.audioCount}
        >
          {audioItemsCount}
        </span>
      )}
      <CloseIcon
        style={{ opacity: expanded ? 1 : 0 }}
        {...styles.closeButton}
        {...colorScheme.set('fill', 'text')}
        size={SIZE}
      />
    </button>
  )
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
    position: 'absolute',
    fontSize: 10,
    top: 15,
    left: 30,
    [mediaQueries.mUp]: {
      top: 21,
      left: 36,
    },
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
