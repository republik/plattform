import { useEffect, useState } from 'react'
import {
  plainButtonRule,
  useColorContext,
  fontStyles,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { ZINDEX_FRAME_TOGGLE, TRANSITION_MS } from '../constants'
import useAudioQueue from '../Audio/hooks/useAudioQueue'
import { useAudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { IconMic } from '@republik/icons'

const SIZE = 28

const AudioPlayerToggle = () => {
  const [colorScheme] = useColorContext()
  const { audioQueue, isAudioQueueAvailable } = useAudioQueue()
  const {
    audioPlayerVisible,
    setAudioPlayerVisible,
    isPlaying,
    isExpanded: audioPlayerExpanded,
    setIsExpanded: setAudioPlayerExpanded,
  } = useAudioContext()
  const audioItemsCount = audioQueue?.length

  // Uhh, fix some server-client hydration mismatch thingie
  const [lazyCount, setLazyCount] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (audioItemsCount !== undefined) {
      setLazyCount(audioItemsCount)
    }
  }, [audioItemsCount])

  const onClick = () => {
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

  return isAudioQueueAvailable ? (
    <button {...styles.menuToggle} onClick={onClick}>
      <div {...styles.audioButton}>
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
    </button>
  ) : null
}

const styles = {
  menuToggle: css(plainButtonRule, {
    ...plainButtonRule,
    zIndex: ZINDEX_FRAME_TOGGLE,
    position: 'relative',
  }),
  audioCount: css({
    ...fontStyles.sansSerifMedium,
    position: 'absolute',
    fontSize: 10,
    top: 0,
    right: 0,
  }),
  audioButton: css({
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
  }),
}

export default AudioPlayerToggle
