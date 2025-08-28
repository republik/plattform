import { mediaQueries } from '@project-r/styleguide'
import BottomPanel from '../Frame/BottomPanel'
import { useAudioContext } from '../Audio/AudioProvider'
import { MINI_AUDIO_PLAYER_HEIGHT } from '../Audio/AudioPlayer/MiniAudioPlayer'
import { useScrollDirection } from '@app/lib/hooks/useScrollDirection'
import { useMediaQuery } from '@project-r/styleguide'

const MAX_HEADER_HEIGHT = 100

const ActionBarOverlay = ({ children }) => {
  const { audioPlayerVisible } = useAudioContext()
  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const audioPlayerOffset = audioPlayerVisible
    ? MINI_AUDIO_PLAYER_HEIGHT + (isDesktop ? 30 : 15)
    : 0

  const scrollDirection = useScrollDirection({
    upThreshold: 25,
    downThreshold: MAX_HEADER_HEIGHT,
  })

  return (
    <BottomPanel offset={audioPlayerOffset} visible={scrollDirection === 'up'}>
      {children}
    </BottomPanel>
  )
}

export default ActionBarOverlay
