import { useInNativeApp } from '../../lib/withInNativeApp'
import compareVersion from '../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from './constants'
import LegacyAudioPlayer from '../Audio/LegacyAudioPlayer/AudioPlayer'
import AudioPlayerContainer from './AudioPlayerContainer'
import AudioPlayerUI from './AudioPlayerUI'

const AudioPlayerOrchestrator = () => {
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()

  // Render the old audio player if we're in a native app and using the old audio-player
  if (
    inNativeApp &&
    compareVersion(inNativeAppVersion, NEW_AUDIO_API_VERSION) < 0
  ) {
    return <LegacyAudioPlayer />
  }

  // Render new audio player if in web or in a native app using the new audio-player
  return (
    <AudioPlayerContainer>
      {(props) => <AudioPlayerUI {...props} />}
    </AudioPlayerContainer>
  )
}

export default AudioPlayerOrchestrator
