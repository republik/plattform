import { css } from 'glamor'
import { IconButton, AddIcon, RemoveIcon } from '@project-r/styleguide'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    justifyContent: 'center',
  }),
}

type PlaybackRateControl = {
  playbackRate: number
  setPlaybackRate: (playbackRate: number) => void
  availablePlaybackRates?: number[]
}

const PlaybackRateControl = ({
  playbackRate,
  setPlaybackRate,
  availablePlaybackRates = [0.5, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4],
}: PlaybackRateControl) => {
  const currentIndex = availablePlaybackRates.indexOf(playbackRate)

  return (
    <div {...styles.root}>
      <IconButton
        Icon={RemoveIcon}
        onClick={() =>
          setPlaybackRate(availablePlaybackRates[currentIndex - 1])
        }
        disabled={currentIndex === 0}
        style={{ marginRight: 0 }}
      />
      <span>{playbackRate}x</span>
      <IconButton
        Icon={AddIcon}
        onClick={() =>
          setPlaybackRate(availablePlaybackRates[currentIndex + 1])
        }
        disabled={currentIndex >= availablePlaybackRates.length - 1}
        style={{ marginRight: 0 }}
      />
    </div>
  )
}

export default PlaybackRateControl
