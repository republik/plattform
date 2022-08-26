import { useInNativeApp } from '../../lib/withInNativeApp'
import compareVersion from '../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from './constants'
import AudioPlayerContainer from './AudioPlayerContainer'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const AudioPlayer = dynamic(() => import('./AudioPlayer/AudioPlayer'), {
  ssr: false,
})

const LegacyAudioPlayer = dynamic(
  () => import('./LegacyAudioPlayer/LegacyAudioPlayer'),
  {
    ssr: false,
  },
)

const AudioPlayerOrchestrator = () => {
  // TODO: Remove before release
  // Enforce usage of the legacy-audio-player for testing purposes
  // by passing legacy=true into the url
  const {
    query: { legacy },
  } = useRouter()
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()
  // Render the old audio player if we're in a native app and using the old audio-player
  if (
    (inNativeApp &&
      compareVersion(inNativeAppVersion, NEW_AUDIO_API_VERSION) < 0) ||
    !!legacy
  ) {
    return <LegacyAudioPlayer />
  }

  // Render new audio player if in web or in a native app using the new audio-player
  return (
    <AudioPlayerContainer>
      {(props) => <AudioPlayer {...props} />}
    </AudioPlayerContainer>
  )
}

export default AudioPlayerOrchestrator
