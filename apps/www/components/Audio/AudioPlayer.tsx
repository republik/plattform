import { AudioContext } from './AudioProvider'
import { AudioPlayer } from '@project-r/styleguide'
import ProgressComponent from '../Article/Progress'
import withT from '../../lib/withT'
import compose from 'lodash/flowRight'
import { AUDIO_PLAYER_HEIGHT } from '../constants'
import Link from '../Link/Href'

import BottomPanel from '../Frame/BottomPanel'
import { useMe } from '../../lib/context/MeContext'
import { usePlaybackRate } from '../../lib/playbackRate'
import { trackEvent } from '../../lib/matomo'

const AudioPlayerFrontend = ({ t }) => {
  const { meLoading } = useMe()
  const [playbackRate, setPlaybackRate] = usePlaybackRate(1)

  return (
    <AudioContext.Consumer>
      {({
        audioPlayerVisible,
        onCloseAudioPlayer,
        audioState,
        autoPlayActive,
      }) => {
        return (
          <>
            {!meLoading && audioState && (
              <BottomPanel wide foreground={true} visible={audioPlayerVisible}>
                <ProgressComponent isArticle={false}>
                  <AudioPlayer
                    // when the audio src changes we need to remount the component
                    key={audioState.mediaId || audioState.url}
                    // mediaId and durationMs is neccessary for media progress to work
                    mediaId={audioState.mediaId}
                    durationMs={audioState.audioSource.durationMs}
                    mode='overlay'
                    src={audioState.audioSource}
                    title={audioState.title}
                    sourcePath={audioState.sourcePath}
                    closeHandler={onCloseAudioPlayer}
                    setPlaybackRate={(rate) => {
                      trackEvent(['AudioPlayer', 'playbackRate', rate])
                      setPlaybackRate(rate)
                    }}
                    playbackRate={playbackRate}
                    autoPlay={autoPlayActive}
                    download
                    t={t}
                    height={AUDIO_PLAYER_HEIGHT}
                    Link={Link}
                  />
                </ProgressComponent>
              </BottomPanel>
            )}
          </>
        )
      }}
    </AudioContext.Consumer>
  )
}

const ComposedAudioPlayer = compose(withT)(AudioPlayerFrontend)

export default ComposedAudioPlayer
