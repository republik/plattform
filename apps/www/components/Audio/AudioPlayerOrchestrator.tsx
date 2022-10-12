import AudioPlayerController from './AudioPlayerController'
import dynamic from 'next/dynamic'
import useAudioQueue from './hooks/useAudioQueue'
import { useAudioContext } from './AudioProvider'

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
  const { isAudioQueueAvailable } = useAudioQueue()
  const { audioPlayerVisible } = useAudioContext()

  // Render the old audio player if we're in a native app and using the old audio-player
  if (!isAudioQueueAvailable) {
    if (audioPlayerVisible) {
      return <LegacyAudioPlayer />
    }
  }
  // Render new audio player if in web or in a native app using the new audio-player
  return (
    <AudioPlayerController>
      {(props) => <AudioPlayer {...props} />}
    </AudioPlayerController>
  )
}

export default AudioPlayerOrchestrator
