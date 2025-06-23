import { AudioContext } from '../AudioProvider'
import { AudioPlayer as LegacyAudioPlayerUI } from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import { AUDIO_PLAYER_HEIGHT } from '../../constants'
import Link from '../../Link/Href'

import BottomPanel from '../../Frame/BottomPanel'
import { useMe } from '../../../lib/context/MeContext'
import { usePlaybackRate } from '../../../lib/playbackRate'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import {
  AudioPlayerLocations,
  AudioPlayerActions,
} from '../types/AudioActionTracking'

const LegacyAudioPlayer = () => {
  const { t } = useTranslation()
  const { meLoading } = useMe()
  const [playbackRate, setPlaybackRate] = usePlaybackRate(1)

  return (
    <AudioContext.Consumer>
      {({
        audioPlayerVisible,
        onCloseAudioPlayer,
        legacyPlayerItem,
        autoPlayActive,
      }) => {
        return (
          <>
            {!meLoading && legacyPlayerItem && (
              <BottomPanel wide foreground={true} visible={audioPlayerVisible}>
                  <LegacyAudioPlayerUI
                    // when the audio src changes we need to remount the component
                    key={
                      legacyPlayerItem.meta.audioSource.mediaId || ' ' //activePlayerItem.url
                    }
                    // mediaId and durationMs is neccessary for media progress to work
                    mediaId={legacyPlayerItem?.meta?.audioSource.mediaId}
                    durationMs={legacyPlayerItem?.meta?.audioSource.durationMs}
                    mode='overlay'
                    src={legacyPlayerItem?.meta?.audioSource}
                    title={legacyPlayerItem?.meta?.title}
                    sourcePath={legacyPlayerItem?.meta?.path}
                    closeHandler={onCloseAudioPlayer}
                    setPlaybackRate={(playbackRate) => {
                      setPlaybackRate(playbackRate)
                      trackEvent([
                        AudioPlayerLocations.AUDIO_PLAYER,
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
              </BottomPanel>
            )}
          </>
        )
      }}
    </AudioContext.Consumer>
  )
}

export default LegacyAudioPlayer
