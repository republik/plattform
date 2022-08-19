import { AudioContext } from '../AudioProvider'
import { LegacyAudioPlayer as LegacyAudioPlayerUI } from '@project-r/styleguide'
import ProgressComponent from '../../Article/Progress'
import { useTranslation } from '../../../lib/withT'
import { AUDIO_PLAYER_HEIGHT } from '../../constants'
import Link from '../../Link/Href'

import BottomPanel from '../../Frame/BottomPanel'
import { useMe } from '../../../lib/context/MeContext'
import { usePlaybackRate } from '../../../lib/playbackRate'
import { trackEvent } from '../../../lib/matomo'

const LegacyAudioPlayer = () => {
  const { t } = useTranslation()
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
                  <LegacyAudioPlayerUI
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

export default LegacyAudioPlayer
