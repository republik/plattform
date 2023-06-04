import { css } from 'glamor'
import {
  IconButton,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { useState } from 'react'
import { IconAdd, IconRemove } from '@republik/icons'

const styles = {
  root: css({
    display: 'inline-flex',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    alignItems: 'center',
    [mediaQueries.sDown]: {
      gap: 8,
    },
  }),
  rate: css({
    ...fontStyles.sansSerifRegular18,
    lineHeight: '18px',
  }),
}

type PlaybackRateControl = {
  playbackRate: number
  setPlaybackRate: (playbackRate: number) => void
  availablePlaybackRates?: number[]
}

// Prevent inaccuracy of floating point numbers to be displayed
const roundPlaybackRate = (playbackRate: number) => {
  return Math.round(playbackRate * 100) / 100
}

const PlaybackRateControl = ({
  playbackRate,
  setPlaybackRate,
  availablePlaybackRates = [0.75, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.25, 2.5],
}: PlaybackRateControl) => {
  const [currentIndex, setCurrentIndex] = useState(
    availablePlaybackRates.indexOf(roundPlaybackRate(playbackRate)),
  )
  const [colorScheme] = useColorContext()

  const handleIncrease = () => {
    if (currentIndex < availablePlaybackRates.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setPlaybackRate(roundPlaybackRate(availablePlaybackRates[nextIndex]))
    }
  }

  const handleDecrease = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1
      setCurrentIndex(nextIndex)
      setPlaybackRate(roundPlaybackRate(availablePlaybackRates[nextIndex]))
    }
  }

  return (
    <div {...styles.root}>
      <IconButton
        Icon={IconRemove}
        onClick={handleDecrease}
        disabled={currentIndex === 0}
        style={{ marginRight: 0 }}
      />
      <span
        style={{ minWidth: '4ch', textAlign: 'center' }}
        {...colorScheme.set('color', 'text')}
      >
        {roundPlaybackRate(playbackRate)}
        {'×'}
      </span>
      <IconButton
        Icon={IconAdd}
        onClick={handleIncrease}
        disabled={currentIndex >= availablePlaybackRates.length - 1}
        style={{ marginRight: 0 }}
      />
    </div>
  )
}

export default PlaybackRateControl
