import { AudioContext } from '../AudioProvider'
import { AudioPlayer as LegacyAudioPlayerUI } from '@project-r/styleguide'
import ProgressComponent from '../../Article/Progress'
import { useTranslation } from '../../../lib/withT'
import { AUDIO_PLAYER_HEIGHT } from '../../constants'
import Link from '../../Link/Href'

import BottomPanel from '../../Frame/BottomPanel'
import { useMe } from '../../../lib/context/MeContext'
import { usePlaybackRate } from '../../../lib/playbackRate'
import { trackEvent } from '../../../lib/matomo'
import {
  AudioPlaybackLocation,
  AudioPlayerActions,
} from '../types/AudioTracking'

const LegacyAudioPlayer = () => {
  const { t } = useTranslation()
  const { meLoading } = useMe()
  const [playbackRate, setPlaybackRate] = usePlaybackRate(1)

  return (
    <AudioContext.Consumer>
      {({
        audioPlayerVisible,
        onCloseAudioPlayer,
        activePlayerItem,
        autoPlayActive,
      }) => {
        return (
          <>
            {!meLoading && activePlayerItem && (
              <BottomPanel wide foreground={true} visible={audioPlayerVisible}>
                <ProgressComponent isArticle={false}>
                  <LegacyAudioPlayerUI
                    // when the audio src changes we need to remount the component
                    key={
                      activePlayerItem.meta.audioSource.mediaId || ' ' //activePlayerItem.url
                    }
                    // mediaId and durationMs is neccessary for media progress to work
                    mediaId={activePlayerItem?.meta?.audioSource.mediaId}
                    durationMs={activePlayerItem?.meta?.audioSource.durationMs}
                    mode='overlay'
                    src={activePlayerItem?.meta?.audioSource}
                    title={activePlayerItem?.meta?.title}
                    sourcePath={activePlayerItem?.meta?.path}
                    closeHandler={onCloseAudioPlayer}
                    setPlaybackRate={(playbackRate) => {
                      setPlaybackRate(playbackRate)
                      trackEvent([
                        AudioPlaybackLocation.PLAYER,
                        AudioPlayerActions.PLAYBACK_RATE_CHANGED,
                        playbackRate,
                      ])
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
